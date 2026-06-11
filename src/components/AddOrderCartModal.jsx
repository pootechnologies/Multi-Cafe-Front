import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Package, CreditCard } from 'lucide-react';
import useAddOrderCartStore from '@/store/useAddOrderCartStore';
import { formatCurrency } from '@/utils/numberFormaterStats';
import axiosInstance from '@/utils/axiosInstance';
import { API_ENDPOINTS } from '@/utils/apiConfig';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

const AddOrderCartModal = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal
  } = useAddOrderCartStore();

  const {
    data: orderDetails,
  } = useQuery({
    queryKey: ["orderDetails", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.ORDERS}/${orderId}`
      );
      return response.data;
    },
    enabled: !!orderId
  });

  const handleProceedToCheckout = async () => {
    const orderItems = orderDetails?.data?.items || [];

    const newOrderItems = cartItems.map((item) => {
      const product = item.product;
      const quantity = item.quantity;
      const total_price = product.selling_price * quantity;

      return {
        product: product.id,
        product_name: product.name,
        quantity: quantity,
        unit_price: product.selling_price,
        total_price: total_price,
        status: "Done",
      };
    });

    const updatedOrderItems = [...orderItems, ...newOrderItems];

    try {
      const payload = {
        items: updatedOrderItems,
      };
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.ORDERS}/${orderId}`,
        payload
      );
      if (response.status === 200) {
        toast.success("Order item added successfully!");
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        await queryClient.invalidateQueries({ queryKey: ["products"] });
        await queryClient.refetchQueries({ queryKey: ["orderDetails"] });
        clearCart();
        closeCart();
        navigate(`/order-detail/${orderId}`);
      } else {
        toast.error("Failed to update order items.");
      }
    } catch (error) {
      toast.error('Failed to update order. Please try again.');
    }
  };

  if (!isCartOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex justify-end animate-in fade-in duration-500"
      onClick={closeCart}
    >
      <div 
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl w-full max-w-md h-full overflow-hidden shadow-2xl animate-in slide-in-from-right duration-500 z-[60] border-l border-slate-200/50 dark:border-slate-800 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 bg-white/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-lg">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-1">Review Items</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Order #{orderId}</p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="h-10 w-10 flex items-center justify-center transition-all duration-200 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-6 animate-in zoom-in-95 duration-500">
              <div className="h-24 w-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center">
                <Package className="w-12 h-12 text-slate-200 dark:text-slate-700" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Your cart is empty</h3>
                <p className="text-sm max-w-[200px] mx-auto">Looks like you haven't added any products yet.</p>
              </div>
              <Button onClick={closeCart} variant="outline" className="rounded-xl px-8">Back to Menu</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.product.specification}`}
                  className="p-5 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300 animate-in slide-in-from-right"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-800 overflow-hidden">
                       <span className="text-2xl font-black text-slate-200 dark:text-slate-700">{item.product.name.charAt(0)}</span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {item.product.name}
                          </h3>
                          {item.product.specification && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[10px] font-bold text-blue-600 dark:text-blue-400 rounded-md uppercase tracking-wider">
                              {item.product.specification}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.product.specification)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="text-base font-black text-slate-900 dark:text-slate-100">
                          {formatCurrency(item.product.selling_price)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center p-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.product.specification, item.quantity - 1)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-black text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.product.specification, item.quantity + 1)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-8 space-y-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
            {/* Total */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">
                  {formatCurrency(getCartTotal())}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={handleProceedToCheckout}
                className="w-full h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/10 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
              >
                <span>Add to Order</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button
                onClick={clearCart}
                className="w-full py-3 text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Entire Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddOrderCartModal;
