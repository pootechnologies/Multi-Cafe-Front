import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { ShoppingBag, Clock, ArrowUpRight, History } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const RecentActivities = () => {
  const navigate = useNavigate();
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Fetch recent activities (orders) using TanStack Query
  const {
    data: recentActivities = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recentActivities"],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.RECENT_ORDERS);
      // Map the response data to our custom format for display
      return response.data
        .map((order) => ({
          id: order.id,
          name: order.customer_name,
          type: "Order",
          description: `${t("new_order_placed_with")} ${order.items.length} ${t(
            "items_totaling_etb"
          )} ${formatCurrency(order.total_amount)}`,
          total: order.total_amount,
          itemCount: order.items.length,
          date: new Date(order.order_date), // Store date as Date object
        }))
        .sort((a, b) => b.date - a.date) // Sort by date in descending order
        .slice(0, 10); // Limit to the 10 most recent activities
    },
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Slightly longer interval for better performance
  });

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm animate-in fade-in duration-700">
        <Spinner className="size-8 text-blue-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">{t("loading_activities")}...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-rose-200/60 dark:border-rose-900/30 shadow-sm">
        <div className="h-16 w-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
          <History className="h-8 w-8" />
        </div>
        <p className="text-rose-600 dark:text-rose-400 font-bold">{t("error_fetching_activities")}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-6 duration-700">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">
              {t("recent_order_activities")}
            </h2>
            <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
              Latest updates from your store
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4 max-h-[500px]">
        {recentActivities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
            <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-slate-200 dark:text-slate-700" />
            </div>
            <div>
              <p className="text-slate-900 dark:text-slate-100 font-bold text-lg">{t("no_recent_activities")}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px] mx-auto mt-1">Orders will appear here once they start coming in.</p>
            </div>
          </div>
        ) : (
          recentActivities.map((activity, index) => (
            <div
              key={index}
              className="group relative p-5 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-all duration-500">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {activity.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(activity.date, { addSuffix: true })}
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-1">
                    New order with <span className="font-black text-slate-700 dark:text-slate-300">{activity.itemCount} items</span>
                  </p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(activity.total)} <span className="text-[10px] ml-0.5 uppercase tracking-tighter opacity-70">ETB</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      #{activity.id.toString().slice(-4)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
        <button 
          onClick={() => navigate("/manage_order")}
          className="text-[13px] font-black text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-2"
        >
          View All Orders <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;
