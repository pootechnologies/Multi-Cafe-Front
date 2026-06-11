import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { AlertTriangle, X, Package } from "lucide-react";

const StockOutModal = ({ isOpen, onClose }) => {
  const [stockOutModal, setStockOutModal] = useState([]);
  const [error, setError] = useState(null);

  const fetchStockOutModal = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.STOCK_LIST);
      if (Array.isArray(response.data)) {
        setStockOutModal(response.data);
      } else {
        setError("Invalid data format received.");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error occurred";
      setError(`Failed to fetch data: ${errorMessage}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStockOutModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{t("stock_details")}</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Products with critical stock levels</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8">
          {error ? (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {stockOutModal.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-bold">{t("no_stock_found")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {stockOutModal.map((product, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between group hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                          {product.name}
                        </span>
                        {product.specification && (
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                            {product.specification}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Stock</span>
                          <span className={`text-lg font-black ${product.stock <= 5 ? 'text-rose-600' : 'text-amber-600'}`}>
                            {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-8">
            <Button 
              className="w-full sm:w-32 rounded-2xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white h-14 font-bold shadow-xl transition-all" 
              onClick={onClose}
            >
              {t("close")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockOutModal;
