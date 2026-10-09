// src/store/useAddressStore.js
//
// Address store backed by Supabase. Same public interface as the previous
// localStorage version, so components don't need to change.

import { create } from 'zustand';
import { supabase } from '../api/supabase';

// Convert a Supabase row (snake_case) to the frontend shape (camelCase).
function fromRow(row) {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    phone: row.phone,
    street: row.street,
    city: row.city,
    state: row.state,
    postal: row.postal,
    isDefault: row.is_default,
  };
}

// Convert a frontend patch to Supabase columns.
function toRow(patch) {
  const row = {};
  if (patch.label !== undefined) row.label = patch.label;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.street !== undefined) row.street = patch.street;
  if (patch.city !== undefined) row.city = patch.city;
  if (patch.state !== undefined) row.state = patch.state;
  if (patch.postal !== undefined) row.postal = patch.postal;
  if (patch.isDefault !== undefined) row.is_default = patch.isDefault;
  return row;
}

export const useAddressStore = create((set, get) => ({
  addresses: [],
  loading: false,
  error: null,

  fetchAddresses: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ addresses: (data ?? []).map(fromRow), loading: false });
  },

  addAddress: async (address) => {
    const current = get().addresses;
    const isFirst = current.length === 0;
    const shouldBeDefault = isFirst || address.isDefault === true;

    // If this becomes the new default, un-default the previous one first.
    if (shouldBeDefault && current.some((a) => a.isDefault)) {
      const { error: clearError } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('is_default', true);
      if (clearError) throw new Error(clearError.message);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...toRow(address), is_default: shouldBeDefault })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const created = fromRow(data);
    set((state) => ({ addresses: [...state.addresses, created] }));
    return created.id;
  },

  updateAddress: async (id, patch) => {
    const { data, error } = await supabase
      .from('addresses')
      .update(toRow(patch))
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    const updated = fromRow(data);
    set((state) => ({
      addresses: state.addresses.map((a) => (a.id === id ? updated : a)),
    }));
  },

  removeAddress: async (id) => {
    const current = get().addresses;
    const removed = current.find((a) => a.id === id);
    const remaining = current.filter((a) => a.id !== id);

    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) throw new Error(error.message);

    let nextAddresses = remaining;

    // If we removed the default, promote the first remaining address.
    if (removed?.isDefault && remaining.length > 0) {
      const promoteId = remaining[0].id;
      const { error: promoteError } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', promoteId);
      if (!promoteError) {
        nextAddresses = remaining.map((a) => ({
          ...a,
          isDefault: a.id === promoteId,
        }));
      }
    }

    set({ addresses: nextAddresses });
  },

  makeDefault: async (id) => {
    // Clear the current default first.
    const { error: clearError } = await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('is_default', true);
    if (clearError) throw new Error(clearError.message);

    const { error: setError } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id);
    if (setError) throw new Error(setError.message);

    set((state) => ({
      addresses: state.addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      })),
    }));
  },

  clear: () => set({ addresses: [], error: null }),
}));