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

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const fetchWeeklyOrders = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SALES_MAN_WEEKLY_SALES);
  return response.data;
};

const fetchMonthlyOrders = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SALES_MAN_MONTHLY_SALES);
  return response.data;
};

const fetchYearlyOrders = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SALES_MAN_YEARLY_SALES);
  return response.data;
};

const fetchUniqueRevenue = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SALES_MAN_REVENUE);
  return response.data;
};

const ChartDataForSalesMan = () => {
  const [period, setPeriod] = useState("weekly");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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

  const {
    data: uniqueRevenue = { total_revenue: 0 },
    isLoading: isUniqueRevenueLoading,
    isError: isUniqueRevenueError,
  } = useQuery({
    queryKey: ["uniqueRevenue"],
    queryFn: fetchUniqueRevenue,
  });

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleDateChange = () => {
    if (startDate && endDate) {
      // Filter logic can be added here if needed
    } else {
      alert("Please select both start date and end date.");
    }
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
        backgroundColor: "rgba(138, 132, 216, 0.6)",
        borderColor: "rgba(138, 132, 216, 1)",
        borderWidth: 1,
      },
    ],
  };

  if (
    weeklyOrdersLoading ||
    monthlyOrdersLoading ||
    yearlyOrdersLoading ||
    isUniqueRevenueLoading
  ) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (
    weeklyOrdersError ||
    monthlyOrdersError ||
    yearlyOrdersError ||
    isUniqueRevenueError
  ) {
    return <div>Error fetching data</div>;
  }

  return (
    <div className="w-full p-5 mt-10">
      <div className="mb-4 flex w-full space-x-1 justify-end">
        <Button
          onClick={() => handlePeriodChange("weekly")}
          className="w-sm text-white"
        >
          {t("weekly")}
        </Button>
        <Button
          onClick={() => handlePeriodChange("monthly")}
          className="w-sm text-white"
        >
          {t("monthly")}
        </Button>
        <Button
          onClick={() => handlePeriodChange("yearly")}
          className="w-sm text-white"
        >
          {t("yearly")}
        </Button>
      </div>
      <div className="w-full h-[400px] sm:h-[400px] md:h-[400px]">
        <Bar
          data={chartJsData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => tooltipItem.raw.toString(),
                },
              },
            },
            elements: {
              bar: {
                borderRadius: {
                  topLeft: 5,
                  topRight: 5,
                  bottomLeft: 2,
                  bottomRight: 60,
                },
              },
            },
          }}
        />
      </div>
      <div className="mt-4 p-4 border max-w-screen-sm mx-auto text-center rounded-lg">
        <h2 className="text-lg font-semibold">
          {startDate && endDate
            ? `${t("selected_date_total")}: ${formatCurrency(
                totalAmount?.toFixed(2)
              )}`
            : `${t("total_sales")}: ${formatCurrency(
                uniqueRevenue.total_revenue?.toFixed(2)
              )}`}
        </h2>
      </div>
    </div>
  );
};

export default ChartDataForSalesMan;
