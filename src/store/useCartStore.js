import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => {
          const next = state.items.filter((i) => i.id !== id);
          return {
            items: next,
            coupon: next.length === 0 ? null : state.coupon,
          };
        }),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (coupon) => set({ coupon }),

      removeCoupon: () => set({ coupon: null }),

      getTotal: () => {
        const { items } = get();
        const raw = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        // Round to 2 decimals — prevents RM59.97000000000001 in the UI
        // and keeps stored order.subtotal consistent with computed total.
        return Math.round(raw * 100) / 100;
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    { name: 'cart-storage' }
  )
);