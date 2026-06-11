import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Trash, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

const PerformaDetailProductsPage = () => {
  const { t } = useTranslation();
  const { performaId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editPerformaItem, setEditPerformaItem] = useState(null);
  const [originalPerformaItem, setOriginalPerformaItem] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const itemsPerPage = 5;

  const fetchPerformaDetails = async (performaId) => {
    const { data } = await axiosInstance.get(
      `${API_ENDPOINTS.PERFORMA_PERFORMAS}${performaId}`
    );
    return data;
  };

  const { data: performaDetailItems, isLoading } = useQuery({
    queryKey: ["performaDetailItems", performaId],
    queryFn: () => fetchPerformaDetails(performaId),
    enabled: !!performaId,
  });

  const selectedPerforma = performaDetailItems?.data?.products;
  const queryClient = useQueryClient();

  const updatePerformaItemMutation = useMutation({
    mutationFn: (updatedData) => {
      const { id, ...delta } = updatedData;
      return axiosInstance.patch(
        `${API_ENDPOINTS.PERFORMA_PRODUCTS}${id}`,
        delta
      );
    },
    onSuccess: () => {
      toast.success("Performa item updated successfully!");
      queryClient.invalidateQueries(["performaDetailItems", performaId]);
      setEditPerformaItem(null);
      setShowUpdateModal(false);
    },
    onError: () => {
      toast.error("Failed to update performa item!");
    },
  });

  const deletePerformaItemMutation = useMutation({
    mutationFn: (performaItemId) =>
      axiosInstance.delete(
        `${API_ENDPOINTS.PERFORMA_PRODUCTS}${performaItemId}`
      ),
    onSuccess: () => {
      toast.success("Performa item deleted successfully!");
      queryClient.invalidateQueries(["performaDetailItems", performaId]);
    },
    onError: () => {
      toast.error("Failed to delete performa item!");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (editPerformaItem) {
      setValue("product_name", editPerformaItem.product_name);
      setValue("unit", editPerformaItem.unit);
      setValue("quantity", editPerformaItem.quantity);
      setValue("unit_price", editPerformaItem.unit_price);
    }
  }, [editPerformaItem, setValue]);

  const handleEditClick = (item) => {
    const normalizedItem = {
      ...item,
      product_name: item.product_name ?? item.product,
    };

    setEditPerformaItem(normalizedItem);
    setOriginalPerformaItem(normalizedItem);
    setShowUpdateModal(true);
  };


  const handleUpdateSubmit = (data) => {
    const updatedPerformaItem = {
      ...editPerformaItem,
      product: data.product_name, // <-- Use `product_name`
      unit: data.unit,
      quantity: data.quantity,
      unit_price: data.unit_price,
    };

    const delta = {};
    if (updatedPerformaItem.product !== originalPerformaItem.product) {
      delta.product = updatedPerformaItem.product;
    }
    if (updatedPerformaItem.unit !== originalPerformaItem.unit) {
      delta.unit = updatedPerformaItem.unit;
    }
    if (updatedPerformaItem.quantity !== originalPerformaItem.quantity) {
      delta.quantity = updatedPerformaItem.quantity;
    }
    if (updatedPerformaItem.unit_price !== originalPerformaItem.unit_price) {
      delta.unit_price = updatedPerformaItem.unit_price;
    }

    if (Object.keys(delta).length > 0) {
      updatePerformaItemMutation.mutate({ id: editPerformaItem.id, ...delta });
    }
  };

  const handleDeleteClick = (performaItemId) => {
    setProductToDelete(performaItemId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deletePerformaItemMutation.mutate(productToDelete);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const sortedItems = [...(selectedPerforma || [])].sort((a, b) => b.id - a.id);
  const pageCount = Math.max(Math.ceil(sortedItems.length / itemsPerPage), 1);
  const displayItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-bold">Performa Products</h1>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          onClick={() => navigate(`/add-performa-products/${performaId}`)}
          className="p-2 text-gray-700 bg-transparent border border-gray-400 rounded-md hover:bg-gray-100"
        >
          {t("add_products")}
        </Button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">{t("loading")}...</div>
      ) : (
        <>
          {/* Desktop DataGrid */}
          <div className="hidden md:block">
            <DataGrid
              sx={{
                "& .MuiDataGrid-footerContainer": { display: "none" },
                "& .MuiDataGrid-scrollbar--horizontal": {
                  display: "scroll",
                  zIndex: 0,
                },
              }}
              rows={displayItems.map((item) => ({
                id: item.id,
                product_name: item.product || "N/A",
                unit: item.unit,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: formatCurrency(item.total_price),
                actions: item,
              }))}
              columns={[
                { field: "id", headerName: t("id"), width: 100 },
                {
                  field: "product_name",
                  headerName: t("product_name"),
                  width: 120,
                },
                { field: "unit", headerName: t("unit"), width: 100 },
                { field: "quantity", headerName: t("quantity"), width: 150 },
                {
                  field: "unit_price",
                  headerName: t("unit_price"),
                  width: 130,
                },
                {
                  field: "total_price",
                  headerName: t("total_price"),
                  width: 80,
                },
                {
                  field: "actions",
                  headerName: t("actions"),
                  width: 200,
                  renderCell: (params) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                          <span className="sr-only">Open actions menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleEditClick(params.row)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4 text-yellow-600" />
                          {t("update")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(params.row.id)}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ),
                },
              ]}
              pageSize={itemsPerPage}
              rowsPerPageOptions={[itemsPerPage]}
              disableSelectionOnClick
            />
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {displayItems.map((item) => (
              <div key={item.id} className="p-4 transition-all bg-white border border-gray-200 rounded-lg shadow hover:shadow-md">
                <div className="flex items-start justify-between pb-3 mb-3 border-b">
                  <div>
                    <h3 className="text-sm text-gray-900">#{item.id}</h3>
                    <p className="mt-1 text-base font-bold">{item.product || "N/A"}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEditClick(item)}>
                        <Edit className="w-4 h-4 mr-2" />{t("update")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(item.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />{t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("unit")}</span>
                    <span className="font-medium text-gray-900">{item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("unit_price")}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.unit_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("quantity")}</span>
                    <span className="font-medium text-gray-900">{item.quantity}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 -mx-1 rounded bg-gray-50">
                    <span className="font-medium text-gray-700">{t("total_price")}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(item.total_price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            count={pageCount}
            variant="outlined"
            page={currentPage}
            onChange={(_, pageNumber) => setCurrentPage(pageNumber)}
            className="flex justify-center mt-4"
          />
        </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-lg w-96">
            <h2 className="pb-2 mb-4 text-xl font-bold border-b">
              {t("are_you_sure")}
            </h2>
            <p className="mb-4">{t("sure_discription_performa")}</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                {t("delete")}
              </Button>
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-lg w-96">
            <h2 className="pb-2 mb-4 text-xl border-b">
              {t("update_performa")}
            </h2>
            <form onSubmit={handleSubmit(handleUpdateSubmit)}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">
                  {t("product_name")}
                </label>
                <input
                  type="text"
                  {...register("product_name", { required: t("product_required") })}
                  className={`w-full border rounded p-2 ${errors.product_name ? "border-red-500" : ""}`}
                />


                {errors.product && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.product.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">{t("unit")}</label>
                <input
                  type="text"
                  {...register("unit")}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">{t("quantity")}</label>
                <input
                  type="number"
                  {...register("quantity", {
                    required: t("quantity_required"),
                    min: { value: 1, message: t("quantity_must_greater_zero") },
                  })}
                  className={`w-full border rounded p-2 ${errors.quantity ? "border-red-500" : ""
                    }`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">
                  {t("unit_price")}
                </label>
                <input
                  type="number"
                  {...register("unit_price", {
                    required: t("unit_price_required"),
                    min: { value: 0.01, message: t("unit_price_must_greater_zero") },
                  })}
                  step="0.01"
                  className={`w-full border rounded p-2 ${errors.unit_price ? "border-red-500" : ""
                    }`}
                />
                {errors.unit_price && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.unit_price.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                >
                  {t("update")}
                </button>
                <Button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"

                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformaDetailProductsPage;
