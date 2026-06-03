import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (
        product,
        quantity = 1,
        selectedColor = null,
        selectedSize = null,
      ) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          (item) =>
            item.id === product.id &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize,
        );

        if (existingItemIndex > -1) {
          const newItems = [...items];
          newItems[existingItemIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({
            items: [
              ...items,
              { ...product, quantity, selectedColor, selectedSize },
            ],
          });
        }
      },
      removeItem: (id, selectedColor = null, selectedSize = null) => {
        const { items } = get();
        set({
          items: items.filter(
            (item) =>
              !(
                item.id === id &&
                item.selectedColor === selectedColor &&
                item.selectedSize === selectedSize
              ),
          ),
        });
      },
      updateQuantity: (
        id,
        quantity,
        selectedColor = null,
        selectedSize = null,
      ) => {
        const { items } = get();
        const newItems = items.map((item) => {
          if (
            item.id === id &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
          ) {
            return { ...item, quantity: Math.max(1, quantity) };
          }
          return item;
        });
        set({ items: newItems });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
