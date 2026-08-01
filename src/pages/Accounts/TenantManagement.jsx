import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axiosInstance from "../../utils/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Database,
  Mail,
  User,
  Calendar,
  Check,
  Plus
} from "lucide-react";

const TenantManagement = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    if (!data.campany_name.trim()) {
      toast.error("Company name is required!");
      return;
    }
    if (!data.email.trim()) {
      toast.error("Email is required!");
      return;
    }
    if (!data.password.trim()) {
      toast.error("Password is required!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axiosInstance.post(
        `${API_ENDPOINTS.TENANT_PROVISION}`,
        {
          campany_name: data.campany_name,
          on_trial: data.on_trial,
          owner: {
            first_name: data.first_name,
            last_name: data.last_name,
            phone_number: data.phone_number,
            email: data.email,
            password: data.password,
          },
        }
      );
      toast.success("Tenant created successfully!");
      reset();
    } catch (error) {
      console.error("There was an error creating the tenant:", error);
      toast.error(error.response?.data?.error || "Failed to create tenant!");
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
               <Plus className="h-6 w-6" />
             </div>
             Add New Tenant
           </h2>
         </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="md:col-span-2">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1 block mb-2">
                 Company Name
               </label>
               <div className="relative group">
                 <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                 <input
                   type="text"
                   {...register("campany_name", { required: true })}
                   className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none"
                   placeholder="Enter company name"
                   autoComplete="off"
                 />
               </div>
              {errors.campany_name && (
                <p className="text-red-500 text-xs mt-1">Company name is required</p>
              )}
            </div>

            {/* First Name */}
            <div>
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1 block mb-2">
                 First Name
               </label>
               <div className="relative group">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                 <input
                   type="text"
                   {...register("first_name")}
                   className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none"
                   placeholder="Enter first name"
                   autoComplete="off"
                 />
               </div>
            </div>

            {/* Last Name */}
            <div>
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1 block mb-2">
                 Last Name
               </label>
               <div className="relative group">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                 <input
                   type="text"
                   {...register("last_name")}
                   className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none"
                   placeholder="Enter last name"
                   autoComplete="off"
                 />
               </div>
            </div>

            {/* Email */}
            <div>
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1 block mb-2">
                 Email
               </label>
               <div className="relative group">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                 <input
                   type="email"
                   {...register("email", { required: true })}
                   className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none"
                   placeholder="Enter email address"
                   autoComplete="off"
                 />
               </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">Email is required</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1 block mb-2">
                 Phone Number
               </label>
               <div className="relative group">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                 <input
                   type="text"
                   {...register("phone_number")}
                   className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none"
                   placeholder="Enter phone number"
                   autoComplete="off"
                 />
               </div>
            </div>

            {/* Password */}
            <div className="md:col-span-2">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1 block mb-2">
                 Password
               </label>
               <div className="relative group">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                 <input
                   type="password"
                   {...register("password", { required: true })}
                   className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none"
                   placeholder="Enter password"
                   autoComplete="off"
                 />
               </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">Password is required</p>
              )}
            </div>

            {/* On Trial */}
             <div className="md:col-span-2 flex flex-row items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
               <div className="space-y-0.5">
                 <label className="text-base font-semibold text-slate-900 dark:text-slate-100">Trial Status</label>
                 <p className="text-sm text-slate-500 dark:text-slate-400">
                   Enable trial period for this tenant
                 </p>
               </div>
               <input
                 type="checkbox"
                 {...register("on_trial")}
                 className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
               />
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
                  Create Tenant
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantManagement;
