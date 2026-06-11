// usePurchaseInnerFormStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePurchaseInnerFormStore = create(
  persist(
    (set) => ({
      // State: key is supplierId, value is form data
      forms: {},

      // Actions
      addItem: (supplierId) =>
        set((state) => {
          const currentForm = state.forms[supplierId] || {
            items: [],
            paymentStatusSecond: "Pending",
            paidAmountSecond: 0,
            errors: [],
          };
          const newItems = [
            ...currentForm.items,
            {
              product: "",
              unit: "",
              description: "",
              quantity: "",
              unitPrice: "",
            },
          ];
          const newErrors = [
            ...currentForm.errors,
            {
              product: "",
              quantity: "",
              unitPrice: "",
            },
          ];
          return {
            forms: {
              ...state.forms,
              [supplierId]: {
                ...currentForm,
                items: newItems,
                errors: newErrors,
              },
            },
          };
        }),

      removeItem: (supplierId, index) =>
        set((state) => {
          const currentForm = state.forms[supplierId] || { items: [], errors: [] };
          const newItems = currentForm.items.filter((_, i) => i !== index);
          const newErrors = currentForm.errors.filter((_, i) => i !== index);
          return {
            forms: {
              ...state.forms,
              [supplierId]: {
                ...currentForm,
                items: newItems,
                errors: newErrors,
              },
            },
          };
        }),

      updateItem: (supplierId, index, field, value) =>
        set((state) => {
          const currentForm = state.forms[supplierId] || { items: [], errors: [] };
          const newItems = currentForm.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          );
          const newErrors = [...currentForm.errors];
          if (field === "product") {
            newErrors[index].product = value.trim() === "" ? "Product name is required" : "";
          } else if (field === "quantity") {
            newErrors[index].quantity =
              value === "" ? "Quantity is required" : value <= 0 ? "Quantity must be greater than zero" : "";
          } else if (field === "unitPrice") {
            newErrors[index].unitPrice =
              value === "" ? "Unit price is required" : value <= 0 ? "Unit price must be greater than zero" : "";
          }
          return {
            forms: {
              ...state.forms,
              [supplierId]: {
                ...currentForm,
                items: newItems,
                errors: newErrors,
              },
            },
          };
        }),

      setPaymentStatusSecond: (supplierId, status) =>
        set((state) => ({
          forms: {
            ...state.forms,
            [supplierId]: {
              ...state.forms[supplierId],
              paymentStatusSecond: status,
            },
          },
        })),

      setPaidAmountSecond: (supplierId, amount) =>
        set((state) => ({
          forms: {
            ...state.forms,
            [supplierId]: {
              ...state.forms[supplierId],
              paidAmountSecond: amount,
            },
          },
        })),

      resetForm: (supplierId) =>
        set((state) => ({
          forms: {
            ...state.forms,
            [supplierId]: {
              items: [
                {
                  product: "",
                  unit: "",
                  description: "",
                  quantity: "",
                  unitPrice: "",
                },
              ],
              paymentStatusSecond: "Pending",
              paidAmountSecond: 0,
              errors: [
                {
                  product: "",
                  quantity: "",
                  unitPrice: "",
                },
              ],
            },
          },
        })),

      // Initialize form for a supplier if it doesn't exist
      initForm: (supplierId) =>
        set((state) => ({
          forms: {
            ...state.forms,
            [supplierId]: state.forms[supplierId] || {
              items: [
                {
                  product: "",
                  unit: "",
                  description: "",
                  quantity: "",
                  unitPrice: "",
                },
              ],
              paymentStatusSecond: "Pending",
              paidAmountSecond: 0,
              errors: [
                {
                  product: "",
                  quantity: "",
                  unitPrice: "",
                },
              ],
            },
          },
        })),
    }),
    {
      name: 'purchase-form-inner-store',
      getStorage: () => localStorage,
    }
  )
);

export default usePurchaseInnerFormStore;
