// usePerformaInnerStorage.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePerformaInnerStorage = create(
  persist(
    (set) => ({
      // State: key is customerId, value is form data
      forms: {},

      // Actions
      addItem: (customerId) =>
        set((state) => {
          const currentForm = state.forms[customerId] || {
            items: [],
            selectedReceipt: { value: "Receipt", label: "Receipt" },
          };
          const newItems = [
            ...currentForm.items,
            {
              product: "",
              unit: "",
              quantity: 1,
              unitPrice: "",
            },
          ];
          return {
            forms: {
              ...state.forms,
              [customerId]: {
                ...currentForm,
                items: newItems,
              },
            },
          };
        }),

      removeItem: (customerId, index) =>
        set((state) => {
          const currentForm = state.forms[customerId] || { items: [] };
          const newItems = currentForm.items.filter((_, i) => i !== index);
          return {
            forms: {
              ...state.forms,
              [customerId]: {
                ...currentForm,
                items: newItems,
              },
            },
          };
        }),

      updateItem: (customerId, index, field, value) =>
        set((state) => {
          const currentForm = state.forms[customerId] || { items: [] };
          const newItems = currentForm.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          );
          return {
            forms: {
              ...state.forms,
              [customerId]: {
                ...currentForm,
                items: newItems,
              },
            },
          };
        }),

      setSelectedReceipt: (customerId, receipt) =>
        set((state) => ({
          forms: {
            ...state.forms,
            [customerId]: {
              ...state.forms[customerId],
              selectedReceipt: receipt,
            },
          },
        })),

      resetForm: (customerId) =>
        set((state) => ({
          forms: {
            ...state.forms,
            [customerId]: {
              items: [
                {
                  product: "",
                  unit: "",
                  quantity: 1,
                  unitPrice: "",
                },
              ],
              selectedReceipt: { value: "Receipt", label: "Receipt" },
            },
          },
        })),

      // Initialize form for a customer if it doesn't exist
      initForm: (customerId) =>
        set((state) => ({
          forms: {
            ...state.forms,
            [customerId]: state.forms[customerId] || {
              items: [
                {
                  product: "",
                  unit: "",
                  quantity: 1,
                  unitPrice: "",
                },
              ],
              selectedReceipt: { value: "Receipt", label: "Receipt" },
            },
          },
        })),
    }),
    {
      name: 'performa-form-inner-storage',
      getStorage: () => localStorage,
    }
  )
);

export default usePerformaInnerStorage;
