import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";
import { t } from "i18next";

// Zod validation schema
const supplierSchema = z.object({
  name: z.string().min(1, t("supplier_name_required") || "Supplier name is required"),
  contact_info: z.string().optional(),
  tin_number: z.string().optional(),
});

const AddSupplier = () => {
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
      await axiosInstance.post(API_ENDPOINTS.SUPPLIERS, data);
      toast.success("Supplier added successfully!");
      reset();
    } catch (error) {
      toast.error("Failed to add supplier. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {t("add_supplier")}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Register a new supplier for your inventory.</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Supplier Name */}
            <div className="md:col-span-2 space-y-2">
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
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <label htmlFor="contact_info" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                {t("contact_information")}
              </label>
              <input
                id="contact_info"
                type="text"
                {...register("contact_info")}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all outline-none text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder={t("enter_contact_info")}
              />
            </div>

            {/* TIN Number */}
            <div className="space-y-2">
              <label htmlFor="tin_number" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                {t("tin_number")}
              </label>
              <input
                id="tin_number"
                type="text"
                {...register("tin_number")}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all outline-none text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder={t("enter_supplier_tin")}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="px-10 h-14 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("add_supplier")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplier;
