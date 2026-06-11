import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { formatCurrency } from "@/utils/numberFormaterStats";
import Pagination from "@mui/material/Pagination";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { ChevronDown, ChevronUp } from "lucide-react";

const fetchOrderItems = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.ORDERITEMSCREDIT);
  return response?.data?.results;
};

const FilterOrders = () => {
  const [filteredOrderItems, setFilteredOrderItems] = useState([]);
  const [receiptFilter, setReceiptFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const itemsPerPage = 10;

  const {
    data: orderItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orderItems"],
    queryFn: fetchOrderItems,
  });

  // Extract unique product names for dropdown
  useEffect(() => {
    if (orderItems.length > 0) {
      setFilteredOrderItems(orderItems);
      const uniqueProducts = [
        ...new Set(orderItems.map((item) => item.product_name)),
      ];
      setProducts(uniqueProducts);
    }
  }, [orderItems]);

  // Apply filters + sort descending by id
  useEffect(() => {
    let filteredItems = orderItems;
    if (receiptFilter !== "all") {
      filteredItems = filteredItems.filter(
        (item) =>
          item.item_receipt ===
          (receiptFilter === "receipt" ? "Receipt" : "No Receipt")
      );
    }
    if (productFilter !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.product_name === productFilter
      );
    }
    // Sort in descending order by original id
    filteredItems = [...filteredItems].sort((a, b) => b.id - a.id);
    setFilteredOrderItems(filteredItems);
    setCurrentPage(1);
  }, [receiptFilter, productFilter, orderItems]);

  const handleReceiptFilterChange = (event) => {
    setReceiptFilter(event.target.value);
  };

  const handleProductFilterChange = (event) => {
    setProductFilter(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const toggleCardExpansion = (id) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const totalOrderCount = filteredOrderItems.length;
  const countWithReceipt = filteredOrderItems.filter(
    (item) => item.item_receipt === "Receipt"
  ).length;
  const countWithoutReceipt = filteredOrderItems.filter(
    (item) => item.item_receipt === "No Receipt"
  ).length;
  const totalAmountSold = filteredOrderItems.reduce((total, item) => {
    return total + (parseFloat(item.price) || 0);
  }, 0);

  const columns = [
    { field: "id", headerName: t("id"), width: 100 },
    { field: "product", headerName: t("products"), width: 150 },
    { field: "receipt", headerName: t("receipt"), width: 150 },
    { field: "package", headerName: t("package"), width: 150 },
    { field: "quantity", headerName: t("quantity"), width: 150 },
    { field: "price", headerName: t("price"), width: 150 },
    { field: "status", headerName: t("status"), width: 150 },
  ];

  const pageCount = Math.ceil(filteredOrderItems.length / itemsPerPage);
  // Apply pagination on already DESC-sorted data
  const displayOrderItems = filteredOrderItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // Keep original id instead of new numbering
  const rows = displayOrderItems.map((item) => ({
    id: item.id,
    product: item.product_name,
    receipt: item.item_receipt,
    package: item.package,
    quantity: item.quantity,
    price: formatCurrency(item.price),
    status: item.status,
  }));

  if (isError) {
    return <div>Error fetching data</div>;
  }

  return (
    <div className="container p-5">
      <h3 className="lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-5 sm:text-sm border-b">
        {t("filter_credit")}
      </h3>
      {/* Summary Cards */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4 max-w-2xl">
        <div className="bg-white rounded-lg border hover:shadow-md shadow-sm transition-all duration-200">
          <div className="p-3">
            <div className="flex items-center space-x-3 mb-2">
              <p className="text-xs font-bold">{t("total_orders")}</p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {totalOrderCount}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-lg border hover:shadow-md shadow-sm transition-all duration-200">
          <div className="p-3">
            <div className="flex items-center space-x-3 mb-2">
              <p className="text-xs font-bold">{t("with_receipt")}</p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {countWithReceipt}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200">
          <div className="p-3">
            <div className="flex items-center space-x-3 mb-2">
              <p className="text-xs font-bold">{t("without_receipt")}</p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {countWithoutReceipt}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200">
          <div className="p-3">
            <div className="flex items-center space-x-3 mb-2">
              <p className="text-xs font-bold">{t("total_amount_sold")}</p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {formatCurrency(totalAmountSold)}
            </h3>
          </div>
        </div>
      </div>
      {/* Filters */}
      <div className="grid lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 gap-4 mt-4">
        <FormControl fullWidth margin="normal">
          <InputLabel id="receipt-filter-label">
            {t("filter_by_receipt")}
          </InputLabel>
          <Select
            labelId="receipt-filter-label"
            id="receipt-filter"
            value={receiptFilter}
            label="Filter by Receipt"
            onChange={handleReceiptFilterChange}
          >
            <MenuItem value="all">{t("all")}</MenuItem>
            <MenuItem value="receipt">{t("with_receipt")}</MenuItem>
            <MenuItem value="no-receipt">{t("without_receipt")}</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="product-filter-label">
            {t("filter_by_product")}
          </InputLabel>
          <Select
            labelId="product-filter-label"
            id="product-filter"
            value={productFilter}
            label="Filter by Product"
            onChange={handleProductFilterChange}
          >
            <MenuItem value="all">{t("all")}</MenuItem>
            {products.map((product, index) => (
              <MenuItem key={index} value={product}>
                {product}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      {/* Desktop DataGrid */}
      <div
        style={{ height: "auto", width: "100%", marginTop: "1rem" }}
        className="mb-14 hidden md:block"
      >
        <DataGrid
          sx={{
            "& .MuiDataGrid-footerContainer": { display: "none" },
            "& .MuiDataGrid-scrollbar--horizontal": {
              display: "scroll",
              zIndex: 0,
            },
          }}
          rows={rows}
          columns={columns}
          loading={isLoading}
        />
        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          className="mt-4 flex justify-center"
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden mt-4 space-y-3">
        {displayOrderItems.map((item) => {
          const isExpanded = expandedCards.has(item.id);
          return (
            <div
              key={item.id}
              className={`bg-white rounded-lg border p-4 transition-all duration-200 ${
                expandedCards.size > 0 && !isExpanded ? "blur-sm" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">#{item.id}</h3>
                  <p className="text-sm text-gray-600">{item.product_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">{t("quantity")}:</span>
                  <span className="ml-1 font-medium">{item.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t("price")}:</span>
                  <span className="ml-1 font-medium">{formatCurrency(item.price)}</span>
                </div>
              </div>

              <button
                onClick={() => toggleCardExpansion(item.id)}
                className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {isExpanded ? (
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

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("receipt")}:</span>
                    <span className="font-medium">{item.item_receipt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("package")}:</span>
                    <span className="font-medium">{item.package}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("status")}:</span>
                    <span className="font-medium">{item.status}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          className="mt-4 flex justify-center"
        />
      </div>
    </div>
  );
};

export default FilterOrders;
