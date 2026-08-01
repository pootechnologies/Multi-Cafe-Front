import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { API_BASE_URL_LOGIN, API_ENDPOINTS } from "../../utils/apiConfig";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Tags, Plus } from "lucide-react";

const BusinessCategoryManagement = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    if (!data.name.trim()) {
      toast.error("Business category name is required!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post(
        `${API_BASE_URL_LOGIN}${API_ENDPOINTS.TENANT_BUSINESS_CATEGORIES}`,
        {
          name: data.name,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success("Business category created successfully!");
      reset();
    } catch (error) {
      console.error("There was an error creating the business category:", error);
      toast.error(error.response?.data?.error || "Failed to create business category!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
       <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
         <div className="bg-gradient-to-r from-slate-900/10 via-slate-800/5 to-transparent px-6 py-6 border-b border-slate-200/60 dark:border-slate-800">
           <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
             <div className="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg shadow-lg">
               <Tags className="h-6 w-6" />
             </div>
             Add Business Category
           </h2>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Business Category Name */}
             <div className="md:col-span-2">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1 block mb-2">
                 Business Category Name
               </label>
               <div className="relative group">
                 <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                 <input
                   type="text"
                   {...register("name", { required: true })}
                   className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none"
                   placeholder="Enter business category name"
                   autoComplete="off"
                 />
               </div>
               {errors.name && (
                 <p className="text-rose-500 text-xs mt-1">Business category name is required</p>
               )}
             </div>
           </div>

           <div className="mt-8 flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
             <Button
               type="submit"
               disabled={isSubmitting}
               className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white rounded-xl px-8 shadow-lg shadow-slate-900/20 transition-all active:scale-95 min-w-[120px]"
             >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessCategoryManagement;
