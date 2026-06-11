import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import {
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Search,
  Layers,
  CheckCircle2,
  Package,
  ChevronRight
} from "lucide-react";
import useAddOrderCartStore from "@/store/useAddOrderCartStore";
import AddOrderCartModal from "@/components/AddOrderCartModal";
import { useParams, useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/imageHelper";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { SpinnerComponet } from "@/utils/SpinnerComponet";

const AddOrderPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantities, setQuantities] = useState({});
  const { addToCart, updateQuantity, cartItems, openCart } = useAddOrderCartStore();

  // Sync quantities with cart items
  useEffect(() => {
    const newQuantities = {};
    cartItems.forEach(item => {
      const key = `${item.product.id}-${item.product.specification}`;
      newQuantities[key] = item.quantity;
    });
    setQuantities(newQuantities);
  }, [cartItems]);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.PRODUCTS}?include_all=True`
      );
      return response.data?.results || [];
    },
  });

  // GROUP PRODUCTS BY NAME AND CATEGORY
  const uniqueProducts = [];
  const productMap = new Map();
  products.forEach((p) => {
    // Use category_name if category ID is missing
    const categoryId = p.category || p.category_name || "Uncategorized";
    const key = `${p.name}-${categoryId}`;
    if (!productMap.has(key)) {
      productMap.set(key, p);
      uniqueProducts.push(p);
    }
  });

  const categories = [
    ...new Map(
      products?.map((p) => {
        const categoryId = p.category || p.category_name || "Uncategorized";
        return [
          categoryId,
          { id: categoryId, name: p.category_name || "Uncategorized", image: p.image },
        ];
      })
    ).values(),
  ];

  // Set default category to "Food" when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      const foodCategory = categories.find(cat => cat.name === "Food");
      if (foodCategory) {
        setActiveCategory(foodCategory.id);
      } else {
        // Default to the first category if "Food" is not found
        setActiveCategory(categories[0].id);
      }
    }
  }, [categories, activeCategory]);

  if (isLoading || isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerComponet />
      </div>
    );
  }

  const filteredProducts = activeCategory
    ? uniqueProducts.filter((p) => (p.category || p.category_name || "Uncategorized") === activeCategory)
    : [];

  const getSpecsForProduct = (name) => {
    return products.filter((p) => p.name === name);
  };

  const increment = (productId, spec) => {
    const product = products.find(p => p.id === productId && p.specification === spec);
    if (product) {
      addToCart(product, 1);
    }
  };

  const decrement = (productId, spec) => {
    const product = products.find(p => p.id === productId && p.specification === spec);
    if (product) {
      const cartItem = cartItems.find(item =>
        item.product.id === productId && item.product.specification === spec
      );
      if (cartItem && cartItem.quantity > 1) {
        updateQuantity(productId, spec, cartItem.quantity - 1);
      } else if (cartItem) {
        updateQuantity(productId, spec, 0);
      }
    }
  };

  const handleProductClick = (product) => {
    const productSpecs = getSpecsForProduct(product.name);
    const hasMultipleSpecs = productSpecs.length > 1;
    if (!hasMultipleSpecs && product.stock === 0) return;
    if (productSpecs.length === 1) {
      // Single specification - add directly to cart
      increment(productSpecs[0].id, productSpecs[0].specification);
    } else {
      // Multiple specifications - open modal
      setSelectedProduct(product);
    }
  };

  const getProductQuantity = (product) => {
    const productSpecs = getSpecsForProduct(product.name);
    if (productSpecs.length === 1) {
      const key = `${productSpecs[0].id}-${productSpecs[0].specification}`;
      return quantities[key] || 0;
    }
    return 0;
  };

  const handleProductDecrement = (product) => {
    const productSpecs = getSpecsForProduct(product.name);
    if (productSpecs.length === 1) {
      decrement(productSpecs[0].id, productSpecs[0].specification);
    }
  };

  const handleClose = () => {
    navigate(`/order-detail/${orderId}`);
  };

  return (
    <>
      <div className="px-5 mt-10 md:mt-0 min-h-screen bg-slate-50/30 dark:bg-background md:p-8 lg:p-12 relative overflow-hidden animate-in fade-in duration-700">
        <div className="max-w-[1600px] mx-auto space-y-8 pb-24">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all hover:scale-105 shadow-sm"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 tracking-tight">
                  {t("add_orders")}
                </h1>
              </div>
            </div>

            {/* Cart Status / Search could go here */}
            {/* <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder={t("search_products")}
                  className="h-12 pl-11 pr-6 rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all w-full sm:w-64"
                />
              </div>
            </div> */}
          </div>

          {/* Categories Slider */}
          <div className="space-y-4">
            {/* <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                {t("categories")}
              </h2>
            </div> */}

            <div
              className="flex items-center gap-6 p-4 -mx-4 overflow-x-auto no-scrollbar"
              style={{ scrollbarWidth: "none" }}
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSelectedProduct(null);
                    }}
                    className={`
                      flex flex-col items-center gap-3 transition-all duration-300 min-w-[100px] group
                      ${isActive ? "scale-110" : "opacity-60 hover:opacity-100"}
                    `}
                  >
                    <div
                      className={`relative rounded-full transition-all duration-300 ${isActive ? "border-4 border-rose-500 p-[2px] scale-110" : "scale-100"
                        }`}
                    >
                      <img
                        src={getImageUrl(cat.image) || "https://media.gettyimages.com/id/182744943/photo/burger.jpg?s=2048x2048&w=gi&k=20&c=nYyPWjKYrH_L7qKv2sS_a27N0lfi5oRKxc6OYvb7IZQ="}
                        alt={cat.name}
                        className="w-[80px] h-[80px] rounded-full object-cover transition-transform duration-200 hover:scale-105"
                      />
                    </div>
                    <span className={`text-sm font-bold tracking-tight ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const specs = getSpecsForProduct(product.name);
              const hasMultipleSpecs = specs.length > 1;
              const hasSpecification = specs.some(s => s.specification && s.specification.trim() !== "");

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`group relative bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-slate-200/60 dark:border-slate-800/60 p-4 transition-all duration-500 overflow-hidden ${
                    !hasMultipleSpecs && product.stock === 0
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-none cursor-pointer"
                  }`}
                >
                  {/* Decorative background glow */}
                  <div className="absolute -right-4 -top-4 h-24 w-24 bg-blue-500/5 rounded-full blur-3xl transition-all group-hover:bg-blue-500/10" />

                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
                    {!hasMultipleSpecs && product.stock !== null && product.stock !== undefined && (
                      <span className={`absolute top-3 right-3 z-10 inline-flex items-center px-2.5 py-1 rounded-xl backdrop-blur-md text-[11px] font-black tracking-tight border shadow-md ${
                        product.stock === 0
                        ? "bg-rose-500/90 text-white border-rose-400/30"
                        : "bg-slate-900/80 text-white border-white/20"
                      }`}>
                        {t("stock") || "Stock"}: {product.stock}
                      </span>
                    )}
                    <img
                      src={getImageUrl(product.image) || "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?q=80&w=1000&auto=format&fit=crop"}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Content */}
                  <div className="space-y-3 px-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    {product.description && (
                      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      {!hasSpecification ? (
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("price")}</p>
                          <p className="text-base font-bold text-slate-900 dark:text-white">
                            {formatCurrency(product.selling_price)}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0.5" />
                      )}

                      <div className="flex items-center">
                        {(() => {
                          if (product.stock === 0) {
                            return null;
                          }

                          const quantity = getProductQuantity(product);

                          if (!hasMultipleSpecs && quantity > 0) {
                            return (
                              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner animate-in fade-in zoom-in-95 duration-300">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductDecrement(product);
                                  }}
                                  className="h-8 w-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-950 text-slate-500 hover:text-rose-600 shadow-sm transition-all active:scale-90"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-6 text-center font-black text-slate-900 dark:text-white text-sm">
                                  {quantity}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductClick(product);
                                  }}
                                  className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md transition-all active:scale-90"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <button className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all group-hover:shadow-blue-500/20 active:scale-90">
                              {hasMultipleSpecs ? <Layers className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Specification Modal */}
        {selectedProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-[20px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-100">
                    {selectedProduct.image ? (
                      <img src={getImageUrl(selectedProduct.image)} alt="" className="h-full w-full object-cover rounded-[20px]" />
                    ) : (
                      <Package className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-1">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      {t("choose_your_specifications")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 max-h-[50vh] overflow-y-auto space-y-4 no-scrollbar">
                {getSpecsForProduct(selectedProduct.name).map((specProduct, index) => {
                  const key = `${specProduct.id}-${specProduct.specification}`;
                  const quantity = quantities[key] || 0;

                  return (
                    <div
                      key={specProduct.id}
                      className={`
                        p-5 rounded-2xl border transition-all duration-300 group
                        ${quantity > 0
                          ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                          : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }
                      `}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {specProduct.specification || t("standard")}
                            </span>
                            {quantity > 0 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(specProduct.selling_price)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              specProduct.stock === 0
                              ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                            }`}>
                              {t("stock") || "Stock"}: {specProduct.stock !== null && specProduct.stock !== undefined ? specProduct.stock : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <button
                            onClick={() => decrement(specProduct.id, specProduct.specification)}
                            disabled={quantity === 0}
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 transition-colors disabled:opacity-30"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-black text-slate-900 dark:text-white text-lg">
                            {quantity}
                          </span>
                          <button
                            onClick={() => increment(specProduct.id, specProduct.specification)}
                            disabled={specProduct.stock === 0}
                            className="h-10 w-10 rounded-lg flex items-center justify-center bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:scale-105 transition-all shadow-md disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <Button
                  onClick={() => setSelectedProduct(null)}
                  className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white font-bold text-lg shadow-xl shadow-slate-900/10 dark:shadow-none flex items-center justify-center gap-2"
                >
                  {t("done")}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
      <AddOrderCartModal />
    </>
  );
};

export default AddOrderPage;
