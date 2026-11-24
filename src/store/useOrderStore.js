// src/store/useOrderStore.js

import { create } from 'zustand';
import { supabase } from '../api/supabase';
import { useAuthStore } from './useAuthStore';

function fromRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    customer: row.customer,
    address: row.address,
    delivery: row.delivery,
    items: row.items,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    coupon: row.coupon,
    shipping: Number(row.shipping),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    receipt: row.receipt_path
      ? {
          fileName: row.receipt_file_name,
          uploadedAt: row.receipt_uploaded_at,
          path: row.receipt_path,
        }
      : null,
    createdAt: row.created_at,
  };
}

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });

    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      set({ orders: [], loading: false, error: null });
      return;
    }

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Defense-in-depth: RLS already restricts by user, but an explicit filter
    // means a misconfigured RLS policy can't leak other users' orders.
    // Admins see all orders (matches the admin RLS policy).
    if (currentUser.role !== 'admin') {
      query = query.eq('user_id', currentUser.id);
    }

    const { data, error } = await query;
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ orders: (data ?? []).map(fromRow), loading: false });
  },

  fetchOrderById: async (id) => {
    const cached = get().orders.find((o) => o.id === id);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;

    const order = fromRow(data);
    set((state) => ({
      orders: [order, ...state.orders.filter((o) => o.id !== order.id)],
    }));
    return order;
  },

  addOrder: async (orderData) => {
    // Thin wrapper over the create_order Edge Function.
    // Inputs (item IDs, quantities, customer, delivery) are validated server-side.
    // Prices/totals/coupon validity are re-derived from Sanity — never trusted from client.
    const { data, error } = await supabase.functions.invoke('create_order', {
      body: orderData,
    });

    if (error) {
      // supabase.functions.invoke puts the raw Response on error.context.
      // Parse it to extract our structured error code + message.
      let parsed = null;
      try {
        if (error.context instanceof Response) {
          parsed = await error.context.json();
        }
      } catch {
        // Body wasn't JSON (e.g. network failure) — fall through to generic message
      }

      const code = parsed?.error?.code ?? 'UNKNOWN';
      const message =
        parsed?.error?.message ?? error.message ?? 'Could not create order';

      const err = new Error(message);
      err.code = code;
      err.details = parsed?.error;
      throw err;
    }

    return data.orderId;
  },

  uploadReceipt: async (order, file) => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');

    const ext = file.name.split('.').pop() || 'bin';
    const path = `${user.id}/${order.id}/receipt.${ext}`;

    // 1. Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) throw new Error(uploadError.message);

    // 2. Update the database record
    const { data, error } = await supabase
      .from('orders')
      .update({
        receipt_path: path,
        receipt_file_name: file.name,
        receipt_uploaded_at: new Date().toISOString(),
        status: 'verifying',
      })
      .eq('id', order.id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    // 3. TRIGGER THE EMAIL EDGE FUNCTION HERE
    try {
      const { error: functionError } = await supabase.functions.invoke('notify-payment', {
        body: { orderId: order.id },
      });
      
      if (functionError) {
        console.error('Email notification failed:', functionError);
        // We don't throw an error here so the user still sees the success screen, 
        // but you might want to handle this differently.
      }
    } catch (err) {
      console.error('Failed to invoke email function:', err);
    }

    const updated = fromRow(data);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === order.id ? updated : o)),
    }));
    return updated;
  },

  updateOrderStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    const updated = fromRow(data);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? updated : o)),
    }));
    return updated;
  },

  completeOrder: async (id, currentReceiptPath) => {
    // DB update first: even if file removal fails, the order is correctly completed.
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'received',
        receipt_path: null,
        receipt_file_name: null,
        receipt_uploaded_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Then attempt file removal. Failure here leaves an orphaned file,
    // which is a much smaller problem than a DB row pointing at a missing file.
    if (currentReceiptPath) {
      const { error: removeError } = await supabase.storage
        .from('receipts')
        .remove([currentReceiptPath]);
      if (removeError) {
        console.error('Receipt file removal failed (orphan will remain):', removeError);
      }
    }

    const updated = fromRow(data);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? updated : o)),
    }));
    return updated;
  },

  deleteOrder: async (id, receiptPath) => {
    // DB delete first, mirroring completeOrder's ordering.
    const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      throw new Error('Delete failed. You might not have admin permissions.');
    }

    if (receiptPath) {
      const { error: removeError } = await supabase.storage
        .from('receipts')
        .remove([receiptPath]);
      if (removeError) {
        console.error('Receipt file removal failed (orphan will remain):', removeError);
      }
    }

    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    }));
  },

  getOrderById: (id) => get().orders.find((o) => o.id === id) ?? null,

  clear: () => set({ orders: [], error: null }),
}));