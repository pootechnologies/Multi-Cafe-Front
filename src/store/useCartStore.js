import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  cartItems: [],
  isCartOpen: false,

  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.product.id === product.id && item.product.specification === product.specification
      );
      
      if (existingItemIndex >= 0) {
        const updatedCartItems = [...state.cartItems];
        updatedCartItems[existingItemIndex].quantity += quantity;
        return { cartItems: updatedCartItems };
      } else {
        return { cartItems: [...state.cartItems, { product, quantity }] };
      }
    });
  },

  removeFromCart: (productId, specification) => {
    set((state) => ({
      cartItems: state.cartItems.filter(
        (item) => !(item.product.id === productId && item.product.specification === specification)
      )
    }));
  },

  updateQuantity: (productId, specification, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, specification);
      return;
    }
    
    set((state) => ({
      cartItems: state.cartItems.map(item =>
        item.product.id === productId && item.product.specification === specification
          ? { ...item, quantity }
          : item
      )
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
    return cartItems.reduce((total, item) => total + (item.product.selling_price * item.quantity), 0);
  },

  getCartItemsCount: () => {
    const { cartItems } = get();
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }
}));

export default useCartStore;