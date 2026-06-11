import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Plus, X, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";

// Zod validation schema
const supplierSchema = z.object({
  name: z.string().min(1, t("enter_supplier_name")),
  contact_info: z
    .string()
    .regex(/^\d{10}$/, t("contact_info_must_ten"))
    .or(z.literal("")), // allows empty string
});

const AddSupplierModal = ({ isOpen, onClose, onSupplierAdded }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(supplierSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.SUPPLIERS, data);
      if (response.status === 201 || response.status === 200) {
        toast.success("Supplier added successfully!");
        reset();
        onSupplierAdded();
        onClose();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to add supplier";
      toast.error(errorMsg);
    }
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
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {t("add_supplier")}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-4">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Supplier Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  {t("supplier_name")}
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`w-full px-5 py-4 rounded-2xl border transition-all outline-none text-sm dark:bg-slate-800 dark:text-white
                    ${errors.name 
                      ? "border-rose-500 ring-4 ring-rose-500/10" 
                      : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  placeholder={t("enter_supplier_name")}
                />
                {errors.name && (
                  <p className="text-rose-500 text-xs font-bold uppercase tracking-wider ml-1">
                    {t("supplier_name_required")}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <label htmlFor="contact_info" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  {t("contact_information")}
                </label>
                <input
                  id="contact_info"
                  type="text"
                  {...register("contact_info")}
                  className={`w-full px-5 py-4 rounded-2xl border transition-all outline-none text-sm dark:bg-slate-800 dark:text-white
                    ${errors.contact_info 
                      ? "border-rose-500 ring-4 ring-rose-500/10" 
                      : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  placeholder={t("enter_contact_info")}
                />
                {errors.contact_info && (
                  <p className="text-rose-500 text-xs font-bold uppercase tracking-wider ml-1">
                    {errors.contact_info.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
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
                className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                <Plus className="mr-2 h-4 w-4" /> {t("add_supplier")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplierModal;
