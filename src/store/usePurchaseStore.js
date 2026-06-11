// usePurchaseStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePurchaseStore = create(
  persist(
    (set) => ({
      // Initial state
      items: [
        {
          product: "",
          unit: "",
          description: "",
          quantity: "",
          unitPrice: "",
        },
      ],
      supplier: null,
      paymentStatusSecond: "Pending",
      paidAmountSecond: 0,

      // Actions
      addItem: () =>
        set((state) => ({
          items: [
            ...state.items,
            {
              product: "",
              unit: "",
              description: "",
              quantity: "",
              unitPrice: "",
            },
          ],
        })),

      removeItem: (index) =>
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        })),

      updateItem: (index, field, value) =>
        set((state) => ({
          items: state.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          ),
        })),

      setSupplier: (supplier) => set({ supplier }),

      setPaymentStatusSecond: (status) => set({ paymentStatusSecond: status }),

      setPaidAmountSecond: (amount) => set({ paidAmountSecond: amount }),

      // Reset the form
      resetForm: () =>
        set({
          items: [
            {
              product: "",
              unit: "",
              description: "",
              quantity: "",
              unitPrice: "",
            },
          ],
          supplier: null,
          paymentStatusSecond: "Pending",
          paidAmountSecond: 0,
        }),
    }),
    {
      name: 'purchase-form-storage', // Key for localStorage
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);

export default usePurchaseStore;
