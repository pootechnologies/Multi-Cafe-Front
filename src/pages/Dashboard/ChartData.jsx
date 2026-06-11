import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { Spinner } from "@/components/ui/spinner";
import { TrendingUp, Calendar, ArrowUpRight } from "lucide-react";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const fetchOrders = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.ORDERS);
  return response.data;
};

const fetchWeeklyOrders = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.WEEKLY_SALES_MANAGER);
  return response.data;
};

const fetchMonthlyOrders = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.MONTHLY_SALES_MANAGER);
  return response.data;
};

const fetchYearlyOrders = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.YEARLY_SALES_MANAGER);
  return response.data;
};

const ChartData = () => {
  const [period, setPeriod] = useState("weekly");

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const {
    data: weeklyOrders = [],
    isLoading: weeklyOrdersLoading,
    isError: weeklyOrdersError,
  } = useQuery({
    queryKey: ["weeklyOrders"],
    queryFn: fetchWeeklyOrders,
  });

  const {
    data: monthlyOrders = [],
    isLoading: monthlyOrdersLoading,
    isError: monthlyOrdersError,
  } = useQuery({
    queryKey: ["monthlyOrders"],
    queryFn: fetchMonthlyOrders,
  });

  const {
    data: yearlyOrders = [],
    isLoading: yearlyOrdersLoading,
    isError: yearlyOrdersError,
  } = useQuery({
    queryKey: ["yearlyOrders"],
    queryFn: fetchYearlyOrders,
  });

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const getChartData = () => {
    let data = [];
    switch (period) {
      case "weekly":
        data = weeklyOrders;
        break;
      case "monthly":
        data = monthlyOrders;
        break;
      case "yearly":
        data = yearlyOrders;
        break;
      default:
        data = [];
    }
    return data;
  };

  const chartData = getChartData();

  const chartJsData = {
    labels: chartData.map((item) => item.period),
    datasets: [
      {
        label: t("sales"),
        data: chartData.map((item) => item.sales),
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(79, 70, 229, 0.9)"); // Indigo-600
          gradient.addColorStop(1, "rgba(79, 70, 229, 0.1)");
          return gradient;
        },
        hoverBackgroundColor: "rgba(79, 70, 229, 1)",
        borderRadius: 12,
        borderSkipped: false,
      },
    ],
  };

  const totalSales = chartData.reduce((acc, curr) => acc + (curr.sales || 0), 0);

  if (
    isLoading ||
    weeklyOrdersLoading ||
    monthlyOrdersLoading ||
    yearlyOrdersLoading
  ) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-200/60 dark:border-slate-800 animate-in fade-in duration-700">
        <Spinner className="size-8 text-blue-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Analyzing revenue data...</p>
      </div>
    );
  }

  if (isError || weeklyOrdersError || monthlyOrdersError || yearlyOrdersError) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-rose-200/60 dark:border-rose-900/30">
         <p className="text-rose-600 dark:text-rose-400 font-bold">Error fetching revenue data</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col animate-in fade-in slide-in-from-left-6 duration-700">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center   justify-between gap-6 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">
              {t("revenue_overview")}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-emerald-500 text-xs font-black flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />
                {formatCurrency(totalSales)}
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                Total for this {period}
              </span>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700">
          {["weekly", "monthly", "yearly"].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`
                px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300
                ${period === p 
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }
              `}
            >
              {t(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-8 min-h-[350px]">
        <Bar
          data={chartJsData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                padding: 12,
                titleFont: { size: 14, weight: "bold" },
                bodyFont: { size: 13 },
                displayColors: false,
                callbacks: {
                  label: (context) => `${formatCurrency(context.raw)} ETB`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  font: { weight: "bold", size: 11 },
                  color: "rgba(148, 163, 184, 0.8)",
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(148, 163, 184, 0.1)",
                  drawBorder: false,
                },
                ticks: {
                  font: { weight: "bold", size: 11 },
                  color: "rgba(148, 163, 184, 0.8)",
                  callback: (value) => formatCurrency(value),
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default ChartData;
