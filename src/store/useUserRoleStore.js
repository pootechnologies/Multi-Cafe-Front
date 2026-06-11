import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserRoleStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'user-role-storage', // unique name for the storage key in localStorage
      getStorage: () => localStorage, // specify the storage engine (localStorage in this case)
      partialize: (state) => ({ user: state.user }), // specify which part of the state to persist
    }
  )
);

export default useUserRoleStore;
