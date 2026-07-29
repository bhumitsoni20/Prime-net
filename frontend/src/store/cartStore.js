import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items;
        const exists = items.find((item) => item._id === product._id);
        if (!exists) {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item._id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        set({ 
          items: get().items.map((item) => 
            item._id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ) 
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price || item.bundlePrice || 0) * item.quantity, 0);
      },

      getItemCount: () => get().items.length,
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
