import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useState } from "react";
import { DollarSign, ArrowUp10 } from "lucide-react";
import { t } from "i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";
import ChartDataForSalesMan from "./ChartDataForSalesMan";
import ExpenseChart from "./ExpenseChart";

const SalesManDashboard = () => {
  const [uniqueRevenue, setUniqueRevenue] = useState(0);
  const [dailySales, setDailySales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUniqueRevenue = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.SALES_MAN_REVENUE
        );
        setUniqueRevenue(response.data);
      } catch (err) {
        console.error("Failed to fetch unique revenue:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUniqueRevenue();
  }, []);

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.SALES_MAN_DAILY_SALES
        );
        setDailySales(response.data);
      } catch (err) {
        console.error("Failed to fetch unique revenue:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDailySales();
  }, []);

  useEffect(() => {
    const fetchTotalOrders = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.SALES_MAN_TOTAL_ORDERS
        );
        setTotalOrders(response.data);
      } catch (err) {
        console.error("Failed to fetch unique revenue:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTotalOrders();
  }, []);

  return (
    <>
      <div className="container p-5 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
        {/* TotalSales Card */}
        <div className="bg-white rounded-lg  border hover:shadow-md shadow-sm transition-all duration-200">
          <div className="p-3">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-50 p-2 rounded-full">
                <DollarSign className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-gray-500 text-xs font-medium">
                {t("total_sales")}
              </p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("etb")} {formatCurrency(uniqueRevenue.total_revenue)}
            </h3>
          </div>
        </div>
        {/* TotalExpense Card */}
        <div className="bg-white rounded-lg  border hover:shadow-md shadow-sm transition-all duration-200">
          <div className="p-3">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-50 p-2 rounded-full">
                <ArrowUp10 className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-gray-500 text-xs font-medium">
                {t("total_product_sold")}
              </p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {totalOrders.total_orders}
            </h3>
          </div>
        </div>
        {/* Daily Sales Card */}
        <div className="bg-white rounded-lg  border hover:shadow-md shadow-sm transition-all duration-200">
          <div className="p-3">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-50 p-2 rounded-full">
                <DollarSign className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-gray-500 text-xs font-medium">
                {t("daily_sales")}
              </p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("etb")} {formatCurrency(dailySales.total_sales)}
            </h3>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-10 justify-items-center">
        <div className="col-span-3 mt-0 lg:mt-14 w-full max-w-full">
          <ChartDataForSalesMan />
        </div>
        <div className="col-span-4 w-full max-w-full">
          <ExpenseChart />
        </div>
      </div>
    </>
  );
};

export default SalesManDashboard;
