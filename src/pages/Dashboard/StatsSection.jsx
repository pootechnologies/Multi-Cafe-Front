import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import axiosInstance from "@/utils/axiosInstance";
import {
  API_BASE_URL,
  API_ENDPOINTS,
} from "@/utils/apiConfig";
import { formatCurrency } from "@/utils/numberFormaterStats";
import StockOutModal from "./StockOutModal";
import {
  RefreshCcw,
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const StatsSection = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState([]);
  const [profit, setProfit] = useState(0);
  const [totalProductsCost, setTotalProductsCost] = useState(0);
  const [StockShortageCount, setStockShortageCount] = useState(0);
  const [dailySales, setDailySales] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const { t } = useTranslation();

  // Fetch total revenue
  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.REVENUE}`);
        if (response.data && response.data.total_revenue !== undefined) {
          setTotalRevenue(response.data.total_revenue);
        } else {
          setError("Invalid data format received for total revenue");
        }
        setLoading(false);
      } catch (err) {
        handleError(err, "Failed to fetch total revenue data");
      }
    };
    fetchTotalRevenue();
  }, []);

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`
        );
        if (Array.isArray(response.data?.results)) {
          setProducts(response?.data?.results);
        } else {
          setError("Invalid data format received");
        }
        setLoading(false);
      } catch (err) {
        handleError(err, "Failed to fetch products data");
      }
    };
    fetchProducts();
  }, []);
  // Fetch near expiry product count
  useEffect(() => {
    const fetchStockShortageCount = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.STOCK_COUNT}`
        );
        if (response.data && response.data.out_of_stock !== undefined) {
          setStockShortageCount(response.data.out_of_stock);
        } else {
          setError("Invalid data format received for near expiry products");
        }
        setLoading(false);
      } catch (err) {
        handleError(err, "Failed to fetch stock shortage data");
      }
    };
    fetchStockShortageCount();
  }, []);

  // Fetch profit data
  useEffect(() => {
    const fetchProfit = async () => {
      try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.PROFIT}`);
        if (response.data && response.data.total_profit !== undefined) {
          setProfit(response.data.total_profit);
        } else {
          setError("Invalid data format received for profit");
        }
        setLoading(false);
      } catch (err) {
        handleError(err, "Failed to fetch profit data");
      }
    };
    fetchProfit();
  }, []);

  // Fetch total product cost
  useEffect(() => {
    const fetchTotalProductCost = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.PRODUCT_COST}`
        );
        if (response.data && response.data.total_product_cost !== undefined) {
          setTotalProductsCost(response.data.total_product_cost);
        } else {
          setError("Invalid data format received for profit");
        }
        setLoading(false);
      } catch (err) {
        handleError(err, "Failed to fetch profit data");
      }
    };
    fetchTotalProductCost();
  }, []);

  // daily sales
  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.DAILY_SALES}`
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

  const handleError = (err, defaultMessage) => {
    const errorMessage =
      err?.response?.data?.message || err?.message || defaultMessage;
    if (err.response && err.response.status === 401) {
      setIsUnauthorized(true);
    } else {
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleRefreshClick = async () => {
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="flex justify-center items-center border p-10">
        <button
          className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md flex flex-col items-center justify-center"
          onClick={handleRefreshClick}
        >
          <RefreshCcw />
          <div className="mt-2">Your login session has expired</div>
        </button>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="group bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
              {t("revenue")}
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t("etb")} {formatCurrency(totalRevenue)}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total accumulated revenue</p>
          </div>
        </div>

        {/* Profit Card */}
        <div className="group bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
              {t("profit")}
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t("etb")} {formatCurrency(profit)}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net earnings after costs</p>
          </div>
        </div>

        {/* Products Card */}
        <div className="group bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-lg">
              Inventory
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {products.length || []}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("total_products")} in catalog</p>
          </div>
        </div>

        {/* Product Cost Card */}
        <div className="group bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
              Costs
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t("etb")} {formatCurrency(totalProductsCost)}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("total_product_cost")}</p>
          </div>
        </div>

        {/* Daily Sales Card */}
        <div className="group bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
              <CalendarDays className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-lg">
              {t("daily_sales")}
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t("etb")} {formatCurrency(dailySales.total_sales)}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total sales today</p>
          </div>
        </div>

        {/* Near Expiry Card */}
        <div
          className="group bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`h-12 w-12 rounded-2xl ${StockShortageCount > 0 ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${StockShortageCount > 0 ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              Alerts
            </span>
          </div>
          <div className="space-y-1">
            <h3 className={`text-2xl font-extrabold tracking-tight ${StockShortageCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {StockShortageCount}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("near_expiry")} / Out of stock</p>
          </div>
        </div>
      </div>
      <StockOutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default StatsSection;
