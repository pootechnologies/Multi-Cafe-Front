import React from "react";
import { X, Package, Tag, Layers, User, Calendar, Hash, Globe, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "i18next";
import useUserRoleStore from "@/store/useUserRoleStore";
import { getImageUrl } from "@/utils/imageHelper";

const Modal = ({ product, onClose }) => {
  if (!product) return null;

  const { user } = useUserRoleStore();
  const role = user?.role || null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{t("product_details")}</h2>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Product ID: {product.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Image Section if needed */}
          {product.image && (
            <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner">
               <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">{t("product_name")}</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{product.name}</p>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">{t("category")}</p>
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100/50 dark:border-blue-900/50 mt-1">
                {product.category_name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50/30 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100/50 dark:border-emerald-900/30">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-1">{t("selling_price")}</p>
              <p className="font-black text-emerald-600 dark:text-emerald-400 text-xl">{product.selling_price} <span className="text-xs ml-0.5">ETB</span></p>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">{t("stock")}</p>
              <p className={`font-black text-xl ${product.stock <= 3 ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
                {product.stock} <span className="text-xs text-slate-400 font-bold ml-1 uppercase">{product.unit}</span>
              </p>
            </div>
          </div>

          {role === "Manager" && (
            <div className="bg-amber-50/30 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-900/30">
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest mb-1">{t("buying_price")}</p>
              <p className="font-black text-amber-600 dark:text-amber-400 text-xl">{product.buying_price} <span className="text-xs ml-0.5">ETB</span></p>
            </div>
          )}

          <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Info className="h-3 w-3" /> {t("description")}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
              {product.description || "No detailed description available for this product."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{t("created_by")}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{product.user}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Globe className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{t("supplier")}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{product.supplier_name || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <Button onClick={onClose} className="rounded-2xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white font-black px-10 h-14 shadow-xl transition-all">
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
