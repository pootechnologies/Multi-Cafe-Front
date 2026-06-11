import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { useState } from "react";
import Pagination from "@mui/material/Pagination";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { ChevronDown, ChevronUp } from "lucide-react";

const ProductLog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});
  const itemsPerPage = 10;

  const fetchProductLogs = async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.PRODUCT_LOG);
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["productLogs"],
    queryFn: fetchProductLogs,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  // Sort data by 'id' in descending order
  const sortedData = [...(data || [])].sort((a, b) => b.id - a.id);

  // Pagination logic
  const pageCount = Math.ceil(sortedData.length / itemsPerPage);
  const displayData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Define columns for DataGrid
  const columns = [
    { field: "id", headerName: t("id"), width: 70 },
    { field: "change_type", headerName: t("changes_on_update"), width: 150 },
    { field: "field_name", headerName: t("field_name"), width: 150 },
    { field: "product_name", headerName: "Product Name", width: 150 },
    { field: "old_value", headerName: t("old_value"), width: 120 },
    { field: "new_value", headerName: t("new_value"), width: 120 },
    {
      field: "timestamp",
      headerName: t("timestamp"),
      width: 200,
      valueFormatter: (params) => formatDateTypeStamp(params),
    },
    { field: "user", headerName: t("user"), width: 120 },
    // { field: "product", headerName: "Product ID", width: 100 },
  ];

  return (
    <div
      style={{ height: "auto", width: "100%" }}
      className="container p-4 mx-auto"
    >
      <h3 className="mt-5 mb-2 font-semibold text-gray-900 border-b lg:text-lg dark:text-white sm:text-sm">
        {t("product_log")}
      </h3>
      {/* Desktop View - DataGrid */}
      <div className="hidden md:block">
        <DataGrid
          rows={displayData}
          columns={columns}
          pageSize={itemsPerPage}
          disableSelectionOnClick
          sx={{
            "& .MuiDataGrid-footerContainer": { display: "none" },
          }}
        />
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {displayData.map((log) => (
          <div key={log.id} className={`bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all ${Object.values(expandedCards).some(v => v) && !expandedCards[log.id] ? 'opacity-40 blur-sm' : ''}`}>
            <div className="flex justify-between items-start mb-3 pb-3 border-b">
              <div>
                <h3 className="font-bold text-lg text-gray-900">#{log.id}</h3>
                <p className="text-sm text-gray-600 mt-1">{log.product_name}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("changes_on_update")}</span>
                <span className="font-medium text-gray-900">{log.change_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("field_name")}</span>
                <span className="font-medium text-gray-900">{log.field_name}</span>
              </div>
              <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                <span className="text-gray-700 font-medium">{t("timestamp")}</span>
                <span className="font-bold text-gray-900">{formatDateTypeStamp(log.timestamp)}</span>
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
                  <span className="text-gray-600">{t("old_value")}</span>
                  <span className="font-medium text-gray-900">{log.old_value || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("new_value")}</span>
                  <span className="font-medium text-gray-900">{log.new_value || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("user")}</span>
                  <span className="font-medium text-gray-900">{log.user}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Pagination
        count={pageCount}
        color="primary"
        page={currentPage}
        onChange={handlePageChange}
        className="flex justify-center mt-4"
      />
    </div>
  );
};

export default ProductLog;
