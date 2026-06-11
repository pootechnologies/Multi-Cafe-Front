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
import { Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

const PerformaDetailModal = ({
  showPerformaDetailsModal,
  closeModal,
  selectedPerformaDetailId,
}) => {
  const { t } = useTranslation();
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editPerformaItem, setEditPerformaItem] = useState(null);
  const [originalPerformaItem, setOriginalPerformaItem] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddPerformaModal, setShowAddPerformaModal] = useState(false);
  const [items, setItems] = useState([
    { product_name: "", unit: "", quantity: 1, unitPrice: "" },
  ]);
  const modalItemsPerPage = 5;

  const fetchPerformaDetails = async (selectedPerformaDetailId) => {
    const { data } = await axiosInstance.get(
      `${API_ENDPOINTS.PERFORMA_PERFORMAS}${selectedPerformaDetailId}`
    );
    return data;
  };

  const { data: performaDetailItems, isLoading } = useQuery({
    queryKey: ["performaDetailItems", selectedPerformaDetailId],
    queryFn: () => fetchPerformaDetails(selectedPerformaDetailId),
    enabled: !!selectedPerformaDetailId,
  });

  const selectedPerforma = performaDetailItems?.data?.products;
  const queryClient = useQueryClient();

  const handleQuantityChange = (index, e) => {
    const newItems = [...items];
    newItems[index].quantity = e.target.value;
    setItems(newItems);
  };

  const handleUnitPriceChange = (index, e) => {
    const newItems = [...items];
    newItems[index].unitPrice = e.target.value;
    setItems(newItems);
  };

  const handleProductNameChange = (index, e) => {
    const newItems = [...items];
    newItems[index].product_name = e.target.value;
    setItems(newItems);
  };

  const handleUnitChange = (index, e) => {
    const newItems = [...items];
    newItems[index].unit = e.target.value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { product_name: "", unit: "", quantity: 1, unitPrice: "" },
    ]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleAddPerforma = async (event) => {
    event.preventDefault();
    const newPerformaItems = items.map((item) => ({
      product: item.product_name,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const updatedPerforma = {
      ...selectedPerforma,
      products: [...selectedPerforma, ...newPerformaItems],
    };

    try {
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.PERFORMA_PERFORMAS}${selectedPerformaDetailId}`,
        updatedPerforma
      );

      if (response.status === 200) {
        toast.success("Performa items added successfully!");
        queryClient.invalidateQueries([
          "performaDetailItems",
          selectedPerformaDetailId,
        ]);
        setShowAddPerformaModal(false);
        setItems([{ product_name: "", unit: "", quantity: 1, unitPrice: "" }]);
      }
    } catch (error) {
      console.error("Error updating performa items:", error);
      toast.error("Failed to update performa items.");
    }
  };

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
      queryClient.invalidateQueries([
        "performaDetailItems",
        selectedPerformaDetailId,
      ]);
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
      queryClient.invalidateQueries([
        "performaDetailItems",
        selectedPerformaDetailId,
      ]);
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
      setValue("product", editPerformaItem.product);
      setValue("unit", editPerformaItem.unit);
      setValue("quantity", editPerformaItem.quantity);
      setValue("unit_price", editPerformaItem.unit_price);
    }
  }, [editPerformaItem, setValue]);

  const handleEditClick = (item) => {
    setEditPerformaItem(item);
    setOriginalPerformaItem({ ...item });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = (data) => {
    const updatedPerformaItem = {
      ...editPerformaItem,
      product: data.product,
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

  if (!showPerformaDetailsModal) {
    return null;
  }

  const sortedItems = [...(selectedPerforma || [])].sort((a, b) => b.id - a.id);
  const modalPageCount = Math.max(
    Math.ceil(sortedItems.length / modalItemsPerPage),
    1
  );
  const displayModalItems = sortedItems.slice(
    (modalCurrentPage - 1) * modalItemsPerPage,
    modalCurrentPage * modalItemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-auto z-10">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-3xl">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-300">
          {t("performa_details")}
        </h2>
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddPerformaModal(true)}
            className="border bg-black text-white rounded-sm px-4 py-1 mb-1"
          >
            {t("add_products")}
          </button>
        </div>
        {isLoading ? (
          <div className="text-center py-10">{t("loading")}...</div>
        ) : (
          <div className="relative overflow-x-auto">
            <DataGrid
              sx={{
                "& .MuiDataGrid-footerContainer": { display: "none" },
                "& .MuiDataGrid-scrollbar--horizontal": {
                  display: "scroll",
                  zIndex: 0,
                },
              }}
              rows={displayModalItems.map((item) => ({
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
              pageSize={modalItemsPerPage}
              rowsPerPageOptions={[modalItemsPerPage]}
              disableSelectionOnClick
            />
            <Pagination
              count={modalPageCount}
              variant="outlined"
              page={modalCurrentPage}
              onChange={(_, pageNumber) => setModalCurrentPage(pageNumber)}
              className="mt-4 flex justify-center"
            />
          </div>
        )}
        <div className="flex justify-end mt-2">
          <Button
            className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
            onClick={closeModal}
          >
            {t("close")}
          </Button>
        </div>
      </div>
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "400px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-bold text-2xl border-b p-1">
              {t("are_you_sure")}
            </h2>
            <p>{t("sure_discription_performa")}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={handleConfirmDelete}
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              >
                {t("delete")}
              </Button>
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="bg-[#913030] hover:bg-[#b35a5a] text-white px-4 py-2 rounded-md"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-md">
            <h2 className="text-xl mb-4 border-b pb-1 border-gray-300">
              {t("update_performa")}
            </h2>
            <form onSubmit={handleSubmit(handleUpdateSubmit)}>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  {t("product_name")}
                </label>
                <input
                  type="text"
                  {...register("product", {
                    required: t("product_required"),
                  })}
                  className={`w-full border rounded p-2 ${errors.product ? "border-red-500" : ""
                    }`}
                />
                {errors.product && (
                  <p className="text-red-500 text-sm mt-1 italic">
                    {errors.product.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">{t("unit")}</label>
                <input
                  type="text"
                  {...register("unit")}
                  className={`w-full border rounded p-2 ${errors.unit ? "border-red-500" : ""
                    }`}
                />
                {errors.unit && (
                  <p className="text-red-500 text-sm mt-1 italic">
                    {errors.unit.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">{t("quantity")}</label>
                <input
                  type="number"
                  {...register("quantity", {
                    required: t("quantity_required"),
                    min: {
                      value: 1,
                      message: t("quantity_must_greater_zero"),
                    },
                  })}
                  className={`w-full border rounded p-2 ${errors.quantity ? "border-red-500" : ""
                    }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1 italic">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  {t("unit_price")}
                </label>
                <input
                  type="number"
                  {...register("unit_price", {
                    required: t("unit_price_required"),
                    min: {
                      value: 0.01,
                      message: t("unit_price_must_greater_zero"),
                    },
                  })}
                  step="0.01"
                  className={`w-full border rounded p-2 ${errors.unit_price ? "border-red-500" : ""
                    }`}
                />
                {errors.unit_price && (
                  <p className="text-red-500 text-sm italic mt-1">
                    {errors.unit_price.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-5">
                <button
                  type="submit"
                  className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
                >
                  {t("update")}
                </button>
                <Button
                  type="button"
                  className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                  onClick={() => setShowUpdateModal(false)}
                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddPerformaModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white w-[90%] lg:max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg shadow-lg">
            <div className="p-8">
              <div className="flex justify-between">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-300">
                  {t("add_performa")}
                </h2>
                <p className="text-sm text-gray-500">
                  {items.length} {t("products")}
                </p>
              </div>
              <div className="h-[50vh] overflow-auto mb-10">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor={`product_name-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("product_name")}
                      </label>
                      <input
                        type="text"
                        id={`product_name-${index}`}
                        value={item.product_name}
                        onChange={(e) => handleProductNameChange(index, e)}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label
                          htmlFor={`unit-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("unit")}
                        </label>
                        <input
                          type="text"
                          id={`unit-${index}`}
                          value={item.unit}
                          onChange={(e) => handleUnitChange(index, e)}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor={`quantity-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("quantity")}
                        </label>
                        <input
                          type="number"
                          id={`quantity-${index}`}
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e)}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor={`unit-price-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("unit_price")}
                        </label>
                        <input
                          type="number"
                          id={`unit-price-${index}`}
                          value={item.unitPrice}
                          onChange={(e) => handleUnitPriceChange(index, e)}
                          className="w-full border rounded p-2"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mb-10">
                      {items.length > 1 && (
                        <Button
                          className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                          type="button"
                          onClick={() => removeItem(index)}
                        >
                          <Trash className="mr-3" />
                          {t("remove")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-row justify-between mt-4">
                <Button
                  type="button"
                  onClick={addItem}
                  className="bg-black text-white px-4 py-2 rounded-md"
                >
                  {t("add_more")}
                </Button>
                <div className="flex flex-row space-x-5">
                  <Button
                    type="button"
                    onClick={handleAddPerforma}
                    className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
                  >
                    {t("submit")}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddPerformaModal(false)}
                    className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformaDetailModal;
