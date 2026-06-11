import { create } from 'zustand';

const useAddOrderCartStore = create((set, get) => ({
  cartItems: [],
  isCartOpen: false,

  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.product.id === product.id && item.product.specification === product.specification
      );

      if (existingItemIndex !== -1) {
        const updatedItems = [...state.cartItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return { cartItems: updatedItems };
      } else {
        return {
          cartItems: [...state.cartItems, { product, quantity }],
        };
      }
    });
  },

  updateQuantity: (productId, specification, newQuantity) => {
    set((state) => {
      if (newQuantity <= 0) {
        return {
          cartItems: state.cartItems.filter(
            (item) => !(item.product.id === productId && item.product.specification === specification)
          ),
        };
      }

      const updatedItems = state.cartItems.map((item) =>
        item.product.id === productId && item.product.specification === specification
          ? { ...item, quantity: newQuantity }
          : item
      );

      return { cartItems: updatedItems };
    });
  },

  removeFromCart: (productId, specification) => {
    set((state) => ({
      cartItems: state.cartItems.filter(
        (item) => !(item.product.id === productId && item.product.specification === specification)
      ),
    }));
  },

  clearCart: () => {
    set({ cartItems: [] });
  },

  openCart: () => {
    set({ isCartOpen: true });
  },

  closeCart: () => {
    set({ isCartOpen: false });
  },

  getCartTotal: () => {
    const { cartItems } = get();
    return cartItems.reduce((total, item) => total + item.product.selling_price * item.quantity, 0);
  },

  getCartItemsCount: () => {
    const { cartItems } = get();
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  },
}));

export default useAddOrderCartStore;