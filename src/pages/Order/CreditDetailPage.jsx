import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Pencil, Trash2, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Pagination from "@mui/material/Pagination";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";
import { t } from "i18next";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const fetchCreditDetails = async (selectedCreditId) => {
  const response = await axiosInstance.get(
    `${API_ENDPOINTS.ORDERS}/${selectedCreditId}`
  );
  return response.data;
};

const CreditDetailPage = () => {
  const { creditId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [editProduct, setEditProduct] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const modalItemsPerPage = 10;
  const { register, handleSubmit, setValue } = useForm();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["creditDetails", creditId],
    queryFn: () => fetchCreditDetails(creditId),
    enabled: !!creditId,
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) =>
      axiosInstance.delete(`${API_ENDPOINTS.ORDERITEMS}/${productId}`),
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries(["creditDetails", creditId]);
      setShowDeleteModal(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete product!");
      console.error("Delete error:", error);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (updatedProduct) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.ORDERITEMS}/${updatedProduct.id}`,
        updatedProduct
      ),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["creditDetails", creditId]);
      setEditProduct(null);
      setShowConfirmationModal(false);
    },
    onError: () => {
      toast.error("Failed to update product!");
    },
  });

  const handleModalPageChange = (event, value) => {
    setModalCurrentPage(value);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
    }
  };

  const showItemDetails = (item) => {
    setSelectedItem(item);
  };

  const handleEditProduct = (item) => {
    setEditProduct(item);
    setValue("quantity", item.quantity);
    setValue("unit_price", item.unit_price || item.product_price);
    setValue("status", item.status);
  };

  const handleDeleteSubmit = (itemId) => {
    setProductToDelete(itemId);
    setShowDeleteModal(true);
  };

  const handleUpdateSubmit = (data) => {
    const updatedProduct = {
      id: editProduct.id,
      unit_price: data.unit_price,
      quantity: data.quantity,
      status: data.status,
    };
    setEditProduct(updatedProduct);
    setShowConfirmationModal(true);
  };

  const handleConfirmUpdate = () => {
    if (editProduct) {
      updateProductMutation.mutate(editProduct);
    }
  };

  const handleAddCreditClick = () => {
    navigate(`/add-credit/${creditId}`);
  };

  if (isLoading) return <div className="container mx-auto p-4">Loading...</div>;
  if (isError) return <div className="container mx-auto p-4">Error fetching credit details</div>;

  // Sort items by ID in descending order
  const sortedData = [...(data?.data?.items || [])].sort((a, b) => b.id - a.id);

  // Calculate the current items to display based on pagination
  const startIndex = (modalCurrentPage - 1) * modalItemsPerPage;
  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + modalItemsPerPage
  );

  return (
    <div className="container p-6">
      <div className="flex items-center mb-6">

        <h1 className="text-lg  w-full font-bold">{t("credit_details")}</h1>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          className="p-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
          onClick={handleAddCreditClick}
        >
          {t("add_credit")}
        </Button>
      </div>

      {/* Desktop View - DataGrid */}
      <div className="hidden md:block">
        <DataGrid
          sx={{
            "& .MuiDataGrid-footerContainer": { display: "none" },
            "& .MuiDataGrid-scrollbar--horizontal": {
              display: "scroll",
              zIndex: 0,
            },
          }}
          rows={paginatedData.map((item) => ({
            id: item.id,
            product_name: item.product_name || "N/A",
            package: item.package || 0,
            quantity: item.quantity,
            item_price: formatCurrency(
              item.unit_price ? item.unit_price : item.product_price
            ),
            status: item.status,
            total_price: formatCurrency(
              item.total_price ? item.total_price : item.price
            ),
            actions: item,
          }))}
          getRowId={(row) => row.id}
          columns={[
            { field: "id", headerName: t("id"), width: 50 },
            {
              field: "product_name",
              headerName: t("product_name"),
              width: 200,
            },
            { field: "package", headerName: t("package"), width: 100 },
            { field: "quantity", headerName: t("quantity"), width: 100 },
            {
              field: "item_price",
              headerName: t("item_price"),
              width: 120,
            },
            {
              field: "total_price",
              headerName: t("total_price"),
              width: 120,
            },
            {
              field: "status",
              headerName: t("status"),
              width: 100,
              renderCell: (params) => {
                const statusColor =
                  params.value === "Pending"
                    ? "orange"
                    : params.value === "Done"
                      ? "green"
                      : "red";
                return (
                  <span
                    style={{
                      backgroundColor: statusColor,
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {params.value}
                  </span>
                );
              },
            },
            {
              field: "actions",
              headerName: t("actions"),
              width: 120,
              renderCell: (params) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => showItemDetails(params.row.actions)}
                    >
                      <Eye className="mr-2 h-4 w-4 text-blue-500" />
                      {t("view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEditProduct(params.row.actions)}
                    >
                      <Pencil className="mr-2 h-4 w-4 text-yellow-600" />
                      {t("update")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteSubmit(params.row.actions.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          disableSelectionOnClick
          autoHeight
        />
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {paginatedData.map((item) => (
          <div key={item.id} className={`bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all ${Object.values(expandedCards).some(v => v) && !expandedCards[item.id] ? 'opacity-40 blur-sm' : ''}`}>
            <div className="flex justify-between items-start mb-3 pb-3 border-b">
              <div>
                <h3 className="text-sm text-gray-900">#{item.id}</h3>
                <p className="text-base font-bold mt-1">{item.product_name}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => showItemDetails(item)}>
                    <Eye className="mr-2 h-4 w-4 text-blue-500" />
                    {t("view")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditProduct(item)}>
                    <Pencil className="mr-2 h-4 w-4 text-yellow-600" />
                    {t("update")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteSubmit(item.id)}>
                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("quantity")}</span>
                <span className="font-medium text-gray-900">{item.quantity}</span>
              </div>
              <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                <span className="text-gray-700 font-medium">{t("total_price")}</span>
                <span className="font-bold text-gray-900">{formatCurrency(item.total_price || item.price)} ETB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t("status")}</span>
                <span className={`px-2.5 py-1 rounded text-xs font-semibold text-white`} style={{ backgroundColor: item.status === "Pending" ? "#f59e0b" : item.status === "Done" ? "#10b981" : "#ef4444" }}>
                  {item.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => setExpandedCards(prev => {
                const isCurrentlyExpanded = prev[item.id];
                return isCurrentlyExpanded ? {} : { [item.id]: true };
              })}
              className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {expandedCards[item.id] ? (
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

            {expandedCards[item.id] && (
              <div className="mt-3 pt-3 border-t space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("package")}</span>
                  <span className="font-medium text-gray-900">{item.package || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("item_price")}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(item.unit_price || item.product_price)} ETB</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Pagination
          count={Math.ceil(sortedData.length / modalItemsPerPage)}
          variant="outlined"
          page={modalCurrentPage}
          onChange={handleModalPageChange}
        />
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
            <h2 className="mb-4 font-bold text-xl border-b pb-2">
              {t("are_you_sure")}
            </h2>
            <p>{t("sure_discription")}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md"
              >
                {t("delete")}
              </Button>
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {editProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-md">
            <h2 className="text-xl mb-4 border-b pb-2 border-gray-300">
              {t("update_orders")}
            </h2>
            <form onSubmit={handleSubmit(handleUpdateSubmit)}>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  {t("product_name")}
                </label>
                <input
                  type="text"
                  value={editProduct.product_name || "N/A"}
                  disabled
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">{t("quantity")}</label>
                <input
                  type="number"
                  {...register("quantity")}
                  min="1"
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  {t("unit_price")}
                </label>
                <input
                  type="number"
                  {...register("unit_price")}
                  min="1"
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">{t("status")}</label>
                <select
                  {...register("status")}
                  className="w-full border rounded p-2"
                >
                  <option value="Done">{t("done")}</option>
                  <option value="Cancelled">{t("cancelled")}</option>
                </select>
              </div>
              <div className="flex justify-end space-x-5">
                <button
                  type="submit"
                  className="bg-[#55B990] hover:bg-[#54ce9b] text-white px-4 py-2 rounded-md mr-2"
                >
                  {t("update")}
                </button>
                <Button
                  type="button"
                  className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                  onClick={() => setEditProduct(null)}
                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-md">
            <h2 className="text-xl border-b pb-2 mb-4">{t("item_detail")}</h2>
            <div className="mb-4">
              <label className="block mb-2 font-bold">
                {t("product_name")}
              </label>
              <p>{selectedItem.product_name || "N/A"}</p>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">{t("quantity")}</label>
              <p>{selectedItem.quantity}</p>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">{t("price")}</label>
              <p>
                Etb{" "}
                {formatCurrency(
                  selectedItem.total_price
                    ? selectedItem.total_price
                    : selectedItem.price
                )}
              </p>
            </div>
            <div className="flex justify-end space-x-5">
              <Button
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                onClick={() => setSelectedItem(null)}
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showConfirmationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-md">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-300">
              {t("confirm_update")}
            </h2>
            <p>{t("do_you_to_update")}</p>
            <div className="flex justify-end mt-4 space-x-5">
              <button
                onClick={handleConfirmUpdate}
                className="bg-[#55B990] hover:bg-[#54ce9b] text-white px-4 py-2 rounded-md"
              >
                {t("yes")}
              </button>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              >
                {t("no")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditDetailPage;