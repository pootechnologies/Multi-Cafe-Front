import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import {
  API_ENDPOINTS
} from "@/utils/apiConfig";
import ChartData from "./ChartData";
import StatsSection from "./StatsSection";
import RecentActivities from "./RecentActivities";
import { Button } from "@/components/ui/button";
import ExpenseChart from "./ExpenseChart";
import { t } from "i18next";
import { Spinner } from "@/components/ui/spinner";

const Home = () => {
  const [showChartData, setShowChartData] = useState(true);
  const [showStockAlertModal, setShowStockAlertModal] = useState(false);

  const fetchProducts = async () => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.PRODUCTS}?include_all=True`
    );
    return response?.data?.all_results;
  };

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        const lowStock = data.filter((product) => Number(product.stock) <= 3);
        if (lowStock.length > 0) {
          const isFirstLogin = localStorage.getItem("isFirstLogin");
          if (isFirstLogin !== "true") {
            setShowStockAlertModal(true);
            localStorage.setItem("isFirstLogin", "true");
          }
        }
      } else {
        console.error("Invalid data format received");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <StatsSection />
      <div>
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => setShowChartData(!showChartData)}
            className={`
              relative px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden group
              ${showChartData 
                ? "bg-indigo-600 text-white shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.5)]" 
                : "bg-rose-600 text-white shadow-[0_10px_25px_-5px_rgba(244,63,94,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(244,63,94,0.5)]"
              }
            `}
          >
            <div className="p-2 relative z-10 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>{showChartData ? t("switch_to_expense") : t("switch_to_revenue")}</span>
            </div>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>

          {/* <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Displaying {showChartData ? "Revenue" : "Expense"} Analytics
          </div> */}
        </div>
        <div className="mt-5 mb-10 grid gap-5 grid-cols-1 lg:grid-cols-2">
          {showChartData ? <ChartData period="weekly" /> : <ExpenseChart />}
          <RecentActivities />
        </div>
      </div>
    </div>
  );
};

export default Home;
