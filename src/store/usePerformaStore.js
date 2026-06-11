import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePerformaStore = create(
  persist(
    (set) => ({
      // Existing state
      selectedCustomerPerforma: null,
      setSelectedCustomerPerforma: (customPerforma) =>
        set({ selectedCustomerPerforma: customPerforma }),

      // New state for the Performa form
      items: [
        { productId: "", product: "", unit: "", quantity: 1, unitPrice: "" },
      ],
      selectedCustomer: null,
      selectedReceipt: "Receipt",
      customerName: "",
      tinNumber: "",
      fsNumber: "",
      performaIdFourDigit: null,

      // Actions for the Performa form
      addItem: () =>
        set((state) => ({
          items: [
            ...state.items,
            { productId: "", product: "", unit: "", quantity: 1, unitPrice: "" },
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

      setSelectedCustomer: (customer) =>
        set({
          selectedCustomer: customer,
          customerName: customer ? customer.name : "",
          tinNumber: customer ? customer.tin_number : "",
          fsNumber: customer ? customer.fs_number : "",
        }),

      setSelectedReceipt: (receipt) => set({ selectedReceipt: receipt }),

      setPerformaIdFourDigit: (id) => set({ performaIdFourDigit: id }),

      resetFormZ: () =>
        set({
          items: [
            { productId: "", product: "", unit: "", quantity: 1, unitPrice: "" },
          ],
          selectedCustomer: null,
          selectedReceipt: "Receipt",
          customerName: "",
          tinNumber: "",
          fsNumber: "",
          performaIdFourDigit: null,
        }),
    }),
    {
      name: 'performa-form-storage', // Key for localStorage
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);

export default usePerformaStore;
