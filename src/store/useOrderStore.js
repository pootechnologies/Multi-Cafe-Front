import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOrderStore = create(
  persist(
    (set) => ({
      // Initial state
      items: [
        {
          productInput: "",
          selectedProduct: null,
          quantity: 0,
          unit_price: "",
          unit: "",
          package: null,
          disabledQuantity: false,
          disabledPackage: false,
          stock: 0,
        },
      ],
      selectedCustomer: null,
      phoneNumber: "",
      tinNumber: "",
      fsNumber: "",
      customerName: "",
      receipt: null,

      // Actions
      addItem: () =>
        set((state) => ({
          items: [
            ...state.items,
            {
              productInput: "",
              selectedProduct: null,
              quantity: 0,
              unit_price: "",
              unit: "",
              package: null,
              disabledQuantity: false,
              disabledPackage: false,
              stock: 0,
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

      setSelectedCustomer: (customer) =>
        set({
          selectedCustomer: customer,
          phoneNumber: customer ? customer.phone : "",
          tinNumber: customer ? customer.tin_number : "",
          fsNumber: customer ? customer.fs_number : "",
          customerName: customer ? customer.name : "",
        }),

      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
      setTinNumber: (tinNumber) => set({ tinNumber }),
      setFsNumber: (fsNumber) => set({ fsNumber }),
      setCustomerName: (customerName) => set({ customerName }),
      setReceipt: (receipt) => set({ receipt }),

      // Reset the form
      resetForm: () =>
        set({
          items: [
            {
              productInput: "",
              selectedProduct: null,
              quantity: 0,
              unit_price: "",
              unit: "",
              package: null,
              disabledQuantity: false,
              disabledPackage: false,
              stock: 0,
            },
          ],
          selectedCustomer: null,
          phoneNumber: "",
          tinNumber: "",
          fsNumber: "",
          customerName: "",
          receipt: null,
        }),
    }),
    {
      name: 'order-form-storage', // Key for localStorage
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);

export default useOrderStore;
