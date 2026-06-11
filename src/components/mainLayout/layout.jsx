import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ShoppingCart, ChevronRight } from "lucide-react";
import BottomNavigation from "../BottomNavigation";
import CartModal from "../CartModal";
import AddOrderCartModal from "../AddOrderCartModal";
import useCartStore from "@/store/useCartStore";
import useAddOrderCartStore from "@/store/useAddOrderCartStore";
import { useLocation } from "react-router-dom";

const MainLayout = ({ children, showSidebar }) => {
  const { openCart: openMainCart, getCartItemsCount: getMainCartCount, cartItems: mainCartItems } = useCartStore();
  const { openCart: openAddOrderCart, getCartItemsCount: getAddOrderCartCount, cartItems: addOrderCartItems } = useAddOrderCartStore();
  const location = useLocation();

  // Check path to determine which cart modal to use
  const isOrderProduct = location.pathname === '/order_product';
  const isUpdatingOrder = location.pathname.startsWith('/add-order/');
  const isNewOrder = location.pathname === '/add_order';

  // Use appropriate cart functions based on path
  const openCart = (isUpdatingOrder || isNewOrder) ? openAddOrderCart : openMainCart;
  const getCartItemsCount = (isUpdatingOrder || isNewOrder) ? getAddOrderCartCount : getMainCartCount;
  const cartItems = (isUpdatingOrder || isNewOrder) ? addOrderCartItems : mainCartItems;

  const showFloatingButton = isOrderProduct || isUpdatingOrder || isNewOrder;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {showSidebar && (
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full min-h-screen p-1 overflow-x-hidden overflow-y-auto bg-[#f5f5f5] main-content">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="w-12 h-12 text-2xl border" />
             
            </div>
            {children}
          </main>
          {/* {isUpdatingOrder ? <AddOrderCartModal /> : <CartModal />} */}
          <BottomNavigation />
        </SidebarProvider>
      )}
      {!showSidebar && (
        <main className="w-full min-h-screen overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      )}

      {/* Global Floating Review Button for specific pages */}
      {showFloatingButton && cartItems.length > 0 && (
        <button
          onClick={openCart}
          className="fixed bottom-24 md:bottom-8 right-8 px-8 py-4 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 z-[10] group"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-600 text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-bounce">
              {cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0)}
            </span>
          </div>
          <span>Review orders</span>
          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
