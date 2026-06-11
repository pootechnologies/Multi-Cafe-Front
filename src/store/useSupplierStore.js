// useSupplierStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSupplierStore = create(persist((set) => ({
  selectedSupplier: null,
  setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),
})));

export default useSupplierStore;
