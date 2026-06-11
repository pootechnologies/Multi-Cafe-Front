import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Plus, X, FolderPlus } from "lucide-react";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const categoryNameForm = useForm();

  const onSubmitCategoryName = (data) => {
    axiosInstance
      .post(API_ENDPOINTS.CATEGORIES, {
        name: data.category_name,
      })
      .then(() => {
        toast.success("Category added successfully!");
        categoryNameForm.reset();
        onCategoryAdded();
        onClose();
      })
      .catch((error) => {
        console.error("There was an error adding the category:", error);
        toast.error("Failed to add category. Please try again.");
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FolderPlus className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {t("add_category")}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={categoryNameForm.handleSubmit(onSubmitCategoryName)} className="p-8 pt-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="category_name"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
              >
                {t("category_name")}
              </label>
              <input
                id="category_name"
                {...categoryNameForm.register("category_name", {
                  required: t("category_name_required"),
                })}
                className={`w-full px-5 py-4 rounded-2xl border transition-all outline-none text-sm dark:bg-slate-800 dark:text-white
                  ${categoryNameForm.formState.errors.category_name
                    ? "border-rose-500 ring-4 ring-rose-500/10"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  }`}
                placeholder={t("enter_category_name")}
                autoComplete="off"
                autoFocus
              />
              {categoryNameForm.formState.errors.category_name && (
                <p className="text-rose-500 text-xs font-bold uppercase tracking-wider ml-1">
                  {categoryNameForm.formState.errors.category_name.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 h-14 rounded-2xl text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-900/10 dark:shadow-none"
              >
                <Plus className="mr-2 h-4 w-4" /> {t("add_category")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
