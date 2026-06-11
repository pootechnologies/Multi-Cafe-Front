import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { X, Pencil, Package, Layers, Info, DollarSign, Database,ChevronDown, Image as ImageIcon, Upload } from "lucide-react";
import { getImageUrl } from "@/utils/imageHelper";

const UpdateModal = ({
  onClose,
  onSubmit,
  selectedProduct,
  register,
  handleSubmit,
  handleFileChange,
  fileName,
  setValue,
}) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStock, setNewStock] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
        const sortedCategories = (response?.data?.results || response?.data || []).sort(
          (a, b) => b.id - a.id
        );
        setCategories(sortedCategories);
        
        // If the product doesn't have a category ID but has a category_name, find and set it
        if (selectedProduct && selectedProduct.category_name && setValue) {
          const matchedCategory = sortedCategories.find(c => c.name === selectedProduct.category_name);
          if (matchedCategory) {
            setValue("category", matchedCategory.id);
          }
        }
      } catch (error) {
        console.error("There was an error fetching the categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [selectedProduct, setValue]);

  const handleFormSubmit = (data) => {
    const finalData = { ...data };
    let stockNumber = selectedProduct.stock;

    if (newStock.trim() !== "") {
      stockNumber = Number(newStock);
      if (Number.isNaN(stockNumber)) {
        alert("Please enter a valid stock number");
        return;
      }
    }

    finalData.stock = stockNumber;
    onSubmit(finalData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[90vh] animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-800">
              <Pencil className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{t("update_product")}</h2>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Editing: {selectedProduct.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Row 1: Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{t("product_name")}</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    defaultValue={selectedProduct.name}
                    {...register("name")}
                    className="pl-12 h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{t("category")}</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    defaultValue={selectedProduct.category ?? ""}
                    {...register("category")}
                    className="w-full pl-12 h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">{t("select_category")}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Prices & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{t("buying_price")}</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={selectedProduct.buying_price}
                    {...register("buyingPrice")}
                    className="pl-12 h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{t("selling_price")}</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={selectedProduct.selling_price}
                    {...register("sellingPrice")}
                    className="pl-12 h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{t("stock")} (Current: {selectedProduct.stock})</label>
                <div className="relative">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                  <Input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="New qty"
                    className="pl-12 h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Product Image</label>
              <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 group hover:border-blue-400 transition-all">
                <div className="h-20 w-20 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {selectedProduct.image && !fileName ? (
                    <img src={getImageUrl(selectedProduct.image)} alt="Current" className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">{fileName || "Click to upload new image"}</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black cursor-pointer hover:scale-105 active:scale-95 transition-all">
                    <Upload className="h-3.5 w-3.5" />
                    SELECT FILE
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{t("description")}</label>
              <div className="relative">
                <Info className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <textarea
                  defaultValue={selectedProduct.description}
                  rows={3}
                  {...register("description")}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm custom-scrollbar"
                  placeholder="Enter detailed product description..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
            <Button type="button" onClick={onClose} className="rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-8 h-12 font-bold transition-all">
              {t("cancel")}
            </Button>
            <Button type="submit" className="rounded-2xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white px-10 h-12 font-black shadow-xl shadow-slate-900/20 transition-all">
              {t("update")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateModal;
