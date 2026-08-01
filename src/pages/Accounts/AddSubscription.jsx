import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { API_BASE_TENANT_URL, API_ENDPOINTS } from "../../utils/apiConfig";
import axiosInstance from "../../utils/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Crown, DollarSign, Hash, Check } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  price: z.string().min(1, "Price is required"),
  duration_days: z.string().min(1, "Duration is required"),
  is_active: z.boolean().default(false),
});

const AddSubscription = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      duration_days: "",
      is_active: false,
    },
  });

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch subscriptions when the component mounts or after adding a subscription
  const fetchSubscriptions = () => {
    setLoading(true);
    axiosInstance
      .get(`${API_BASE_TENANT_URL}${API_ENDPOINTS.TENANT_SUBSCRIPTIONS_MANAGE}`)
      .then((response) => {
        setSubscriptions(response.data.results || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the subscriptions:", error);
        setLoading(false);
      });
  };

  // UseEffect to fetch subscriptions on component mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Handle form submission for adding subscription
  const onSubmitSubscription = async (data) => {
    setIsSubmitting(true);
    axiosInstance
      .post(`${API_BASE_TENANT_URL}${API_ENDPOINTS.TENANT_SUBSCRIPTIONS_MANAGE}`, {
        name: data.name,
        price: parseFloat(data.price),
        duration_days: parseInt(data.duration_days),
        is_active: data.is_active,
      })
      .then((response) => {
        toast.success("Subscription plan created successfully!");
        form.reset();
        fetchSubscriptions();
      })
      .catch((error) => {
        console.error("There was an error adding the subscription:", error);
        toast.error(error.response?.data?.error || "Failed to add subscription plan");
        form.reset();
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900/10 via-slate-800/5 to-transparent px-6 py-6 border-b border-slate-200/60 dark:border-slate-800">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            <div className="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg shadow-lg">
              <Crown className="h-6 w-6" />
            </div>
            Add Subscription Plan
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitSubscription)} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                      Plan Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Crown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                        <Input
                          className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all"
                          placeholder="Enter plan name"
                          autoComplete="off"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                      Price
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                        <Input
                          type="number"
                          step="0.01"
                          className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all"
                          placeholder="0.00"
                          autoComplete="off"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                      Duration (Days)
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                        <Input
                          type="number"
                          className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all"
                          placeholder="30"
                          autoComplete="off"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 flex flex-row items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-semibold text-slate-900 dark:text-slate-100">Active Status</FormLabel>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Enable this subscription plan for users
                      </p>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
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
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Plan
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddSubscription;
