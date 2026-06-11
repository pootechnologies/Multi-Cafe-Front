import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, isWithinInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { Receipt, Calendar, X, TrendingDown, ArrowDownRight } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ExpenseChart = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [expensesData, setExpensesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchExpenses = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.OTHER_EXPENSE);
      setExpensesData(response.data);
      setFilteredData(response.data);
      setTotalAmount(
        response.data.reduce((sum, item) => sum + parseFloat(item.cost), 0)
      );
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses.");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    const filterData = () => {
      let filtered = expensesData;
      if (startDate && endDate) {
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        filtered = expensesData.filter((expense) =>
          isWithinInterval(parseISO(expense.created_at), {
            start: startDate,
            end: adjustedEndDate,
          })
        );
      } else {
        filtered = expensesData;
      }
      setFilteredData(filtered);
      setTotalAmount(
        filtered.reduce((sum, item) => sum + parseFloat(item.cost), 0)
      );
    };
    filterData();
  }, [startDate, endDate, expensesData]);

  const isValidDate = (date) => {
    return expensesData.some(
      (expense) =>
        new Date(expense.created_at).toDateString() === date.toDateString()
    );
  };

  const chartData = {
    labels: filteredData.map((item) =>
      format(parseISO(item.created_at), "MMM dd")
    ),
    datasets: [
      {
        label: t("expense"),
        data: filteredData.map((item) => parseFloat(item.cost)),
        borderColor: "#F43F5E", // Rose-500
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(244, 63, 94, 0.2)");
          gradient.addColorStop(1, "rgba(244, 63, 94, 0)");
          return gradient;
        },
        borderWidth: 3,
        pointBackgroundColor: "#F43F5E",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="w-full h-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-6 duration-700">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-800">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">
              {t("expense_analytics")}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-rose-500 text-xs font-black flex items-center gap-0.5">
                <ArrowDownRight className="h-3 w-3" />
                {formatCurrency(totalAmount)}
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                {startDate && endDate ? t("selected_period") : t("total_expenses")}
              </span>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 z-10" />
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="MMM dd"
              className="pl-9 pr-3 py-2 w-28 bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              placeholderText={t("start")}
              filterDate={isValidDate}
            />
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 z-10" />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="MMM dd"
              className="pl-9 pr-3 py-2 w-28 bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              placeholderText={t("end")}
              filterDate={isValidDate}
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-8 min-h-[350px]">
        <Line
          data={chartData}
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

export default ExpenseChart;
