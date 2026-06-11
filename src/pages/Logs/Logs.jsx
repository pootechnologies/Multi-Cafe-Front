import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-hot-toast";
import { Pagination } from "@mui/material";
import { formatTimestamp } from "@/utils/timeFormater";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance"; // Import your axiosInstance
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Spinner } from "@/components/ui/spinner";
import { ChevronDown, ChevronUp } from "lucide-react";

const PAGE_SIZE = 10; // Match your backend page size

const Logs = () => {
  const [page, setPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["logs", page],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.LOGS}?page=${page}`
      );
      // Sort logs by 'timestamp' in descending order
      const sortedLogs = response.data.results.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      return {
        results: sortedLogs,
        count: response.data.count,
      };
    },
    onError: () => toast.error("Failed to load logs"),
  });

  const handlePageChange = (event, value) => setPage(value);
  const totalPages = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;

  const columns = [
    { field: "id", headerName: t("id"), width: 80 },
    { field: "user", headerName: t("user"), width: 150 },
    { field: "action", headerName: t("action"), width: 150 },
    { field: "model_name", headerName: t("model_name"), width: 150 },
    {
      field: "timestamp",
      headerName: t("timestamp"),
      width: 200,
      valueFormatter: (params) => formatTimestamp(params),
    },
    { field: "customer_info", headerName: t("customer_info"), width: 200 },
    { field: "product_name", headerName: t("product_name"), width: 200 },

    {
      field: "product_bundle",
      headerName: "Bundle",
      width: 100
    },
    { field: "quantity", headerName: t("quantity"), width: 100 },
    { field: "price", headerName: t("price"), width: 150 },
    {
      field: "changes_on_update",
      headerName: t("changes_on_update"),
      width: 250,
    },
  ];

  if (isLoading)
    return (
      <div className="mt-20 h-1/2 flex justify-center items-center">
        <Spinner className="size-6" />
      </div>
    );
  if (isError)
    return (
      <p className="mt-4 text-red-500">{t("failed_to_load_logs_try_again")}</p>
    );

  return (
    <div className="min-h-screen py-10 px-4 max-w-[1500px] pl-5 pr-5">
      <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
        {t("logs")}
      </h3>
      {/* Desktop View - DataGrid */}
      <div className="hidden md:block">
        <DataGrid
          sx={{ "& .MuiDataGrid-footerContainer": { display: "none" } }}
          rows={data?.results || []}
          columns={columns}
          loading={isLoading}
          autoHeight
          pageSizeOptions={[]}
          disableRowSelectionOnClick
        />
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {data?.results?.map((log) => (
          <div key={log.id} className={`bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all ${Object.values(expandedCards).some(v => v) && !expandedCards[log.id] ? 'opacity-40 blur-sm' : ''}`}>
            <div className="flex justify-between items-start mb-3 pb-3 border-b">
              <div>
                <h3 className="font-bold text-lg text-gray-900">#{log.id}</h3>
                <p className="text-sm text-gray-600 mt-1">{log.user}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("action")}</span>
                <span className="font-medium text-gray-900">{log.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("model_name")}</span>
                <span className="font-medium text-gray-900">{log.model_name}</span>
              </div>
              <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                <span className="text-gray-700 font-medium">{t("timestamp")}</span>
                <span className="font-bold text-gray-900">{formatTimestamp(log.timestamp)}</span>
              </div>
            </div>

            <button
              onClick={() => setExpandedCards(prev => {
                const isCurrentlyExpanded = prev[log.id];
                return isCurrentlyExpanded ? {} : { [log.id]: true };
              })}
              className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {expandedCards[log.id] ? (
                <>
                  <span>Hide Details</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Show Details</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>

            {expandedCards[log.id] && (
              <div className="mt-3 pt-3 border-t space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("customer_info")}</span>
                  <span className="font-medium text-gray-900">{log.customer_info || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("product_name")}</span>
                  <span className="font-medium text-gray-900">{log.product_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Specification</span>
                  <span className="font-medium text-gray-900">{log.product_specification || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bundle</span>
                  <span className="font-medium text-gray-900">{log.product_bundle || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("quantity")}</span>
                  <span className="font-medium text-gray-900">{log.quantity || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("price")}</span>
                  <span className="font-medium text-gray-900">{log.price || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">{t("changes_on_update")}</span>
                  <span className="font-medium text-gray-900 break-words">{log.changes_on_update || "N/A"}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </div>
    </div>
  );
};

export default Logs;
