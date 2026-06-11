import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Eye, 
  Pencil, 
  Trash2, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Hash, 
  Package, 
  Layers, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";
import { t } from "i18next";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { getImageUrl } from "@/utils/imageHelper";
import ImageModal from "@/components/Products/ManageProduct/ImageModal";
import { SpinnerComponet } from "@/utils/SpinnerComponet";

const fetchOrderDetails = async (selectedOrderId) => {
  const response = await axiosInstance.get(
    `${API_ENDPOINTS.ORDERS}/${selectedOrderId}`
  );
  return response.data;
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [editProduct, setEditProduct] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const modalItemsPerPage = 10;
  const { register, handleSubmit, setValue } = useForm();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orderDetails", orderId],
    queryFn: () => fetchOrderDetails(orderId),
    enabled: !!orderId,
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) =>
      axiosInstance.delete(`${API_ENDPOINTS.ORDERITEMS}/${productId}`),
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries(["orderDetails", orderId]);
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
      queryClient.invalidateQueries(["orderDetails", orderId]);
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

  const handleAddOrderClick = () => {
    navigate(`/add-order/${orderId}`);
  };

  const showItemDetails = (item) => {
    setSelectedItem(item);
  };

  const handleEditProduct = (item) => {
    setEditProduct(item);
    setValue("quantity", item.quantity);
    setValue("unit_price", item.product_price);
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

  const handleImageClick = (imageUrl) => {
    if (imageUrl) {
      setSelectedImage(getImageUrl(imageUrl));
      setIsImageModalOpen(true);
    }
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  if (isLoading || isError) {
    return (
      <div className="container p-4 mx-auto min-h-screen flex items-center justify-center">
        <SpinnerComponet />
      </div>
    );
  }

  // Sort items by ID in descending order
  const sortedData = [...(data?.data?.items || [])].sort((a, b) => b.id - a.id);

  // Calculate the current items to display based on pagination
  const startIndex = (modalCurrentPage - 1) * modalItemsPerPage;
  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + modalItemsPerPage
  );

  return (
    <div className="px-5 mt-10 md:mt-0 min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-background md:p-8 lg:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/manage_order')}
                className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all hover:scale-105 shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="lg:text-4xl md:text-3xl text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 tracking-tight">
                {t("order_details")}
              </h1>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button
              onClick={handleAddOrderClick}
              className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 rounded-xl h-12 px-6 font-semibold"
            >
              <Plus className="h-5 w-5" />
              {t("add_orders")}
            </Button>
          </div>
        </div>

        {/* Desktop View - Custom Table */}
        <div className="hidden md:block bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 overflow-hidden relative">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100/80 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">PRODUCT</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">QUANTITY</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">PRICE</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">TOTAL</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">STATUS</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm text-right pr-8">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div 
                          className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors overflow-hidden border border-slate-200/60 dark:border-slate-700 shrink-0 cursor-pointer"
                          onClick={() => handleImageClick(item.product_image)}
                        >
                          {item.product_image ? (
                            <img src={getImageUrl(item.product_image)} alt={item.product_name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <Package className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">{item.product_name || "N/A"}</span>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                            <Hash className="h-3 w-3" /> {item.id}
                          </span>
                        </div>
                      </div>
                    </td>
                   
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatCurrency(item.product_price)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {formatCurrency(item.total_price || item.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${
                        item.status === "Done" 
                          ? "bg-emerald-600 dark:bg-emerald-500" 
                          : item.status === "Pending"
                          ? "bg-amber-500 dark:bg-amber-400"
                          : "bg-rose-600 dark:bg-rose-500"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all flex items-center justify-center">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-2xl">
                          <DropdownMenuItem
                            onClick={() => showItemDetails(item)}
                            className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                            {t("view")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditProduct(item)}
                            className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
                          >
                            <Pencil className="h-4 w-4 text-yellow-600" />
                            {t("update")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteSubmit(item.id)}
                            className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100/80 dark:border-slate-800 px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Showing Page <span className="text-slate-900 dark:text-slate-100 font-bold">{modalCurrentPage}</span> of <span className="text-slate-900 dark:text-slate-100 font-bold">{Math.ceil(sortedData.length / modalItemsPerPage)}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setModalCurrentPage(p => Math.max(1, p - 1))} 
                disabled={modalCurrentPage === 1}
                variant="outline"
                className="h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, Math.ceil(sortedData.length / modalItemsPerPage)) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setModalCurrentPage(pageNum)}
                      className={`h-9 w-9 rounded-xl text-sm font-bold transition-all ${
                        modalCurrentPage === pageNum 
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button 
                onClick={() => setModalCurrentPage(p => Math.min(Math.ceil(sortedData.length / modalItemsPerPage), p + 1))} 
                disabled={modalCurrentPage >= Math.ceil(sortedData.length / modalItemsPerPage)}
                variant="outline"
                className="h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
          {paginatedData.map((item) => (
            <div key={item.id} className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg rounded-[24px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-inner overflow-hidden border border-slate-200/60 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(item.product_image)}
                  >
                    {item.product_image ? (
                      <img src={getImageUrl(item.product_image)} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">Item #{item.id}</p>
                    <p className="font-extrabold text-slate-900 dark:text-slate-100 text-lg leading-none">{item.product_name || "N/A"}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-2xl z-50">
                    <DropdownMenuItem onClick={() => showItemDetails(item)} className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium">
                      <Eye className="h-4 w-4 text-blue-500" />
                      {t("view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditProduct(item)} className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium">
                      <Pencil className="h-4 w-4 text-yellow-600" />
                      {t("update")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteSubmit(item.id)} className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium">
                      <Trash2 className="h-4 w-4 text-red-600" />
                      {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t("quantity")}</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{item.quantity}</p>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t("total_price")}</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{formatCurrency(item.total_price || item.price)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className={`flex-1 flex justify-center items-center py-2 rounded-xl text-[11px] font-bold text-white shadow-sm ${
                  item.status === "Done" ? "bg-emerald-600" : item.status === "Pending" ? "bg-amber-500" : "bg-rose-600"
                }`}>
                  {item.status}
                </span>
              </div>

              <button
                onClick={() => setExpandedCards(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="w-full pt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                {expandedCards[item.id] ? (
                  <>
                    <span>Hide Details</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Show Full Details</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>

              {expandedCards[item.id] && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <span className="text-slate-500">{t("package")}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{item.package || 0}</span>
                    </div>
                    <div className="flex justify-between py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <span className="text-slate-500">{t("item_price")}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(item.product_price)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Mobile Pagination */}
          <div className="flex flex-col items-center gap-4 pt-2 pb-12">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {modalCurrentPage} of {Math.ceil(sortedData.length / modalItemsPerPage)}</span>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setModalCurrentPage(p => Math.max(1, p - 1))} 
                disabled={modalCurrentPage === 1}
                className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/60 dark:border-slate-800 flex items-center justify-center p-0"
              >
                <ChevronLeft className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              </Button>
              <Button 
                onClick={() => setModalCurrentPage(p => Math.min(Math.ceil(sortedData.length / modalItemsPerPage), p + 1))} 
                disabled={modalCurrentPage >= Math.ceil(sortedData.length / modalItemsPerPage)}
                className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/60 dark:border-slate-800 flex items-center justify-center p-0"
              >
                <ChevronRight className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 text-center">
              <div className="h-20 w-20 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-4">
                <Trash2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                {t("are_you_sure")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">{t("sure_discription")}</p>
            </div>
            <div className="p-8 flex gap-4">
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 h-14 font-bold"
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white h-14 font-bold shadow-xl shadow-rose-600/20"
              >
                {t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditProduct(null)}>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div 
                  className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-100 overflow-hidden border border-slate-200/60 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(editProduct.product_image)}
                >
                  {editProduct.product_image ? (
                    <img src={getImageUrl(editProduct.product_image)} alt={editProduct.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <Layers className="h-6 w-6" />
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{t("update_orders")}</h2>
              </div>
            </div>
            <form onSubmit={handleSubmit(handleUpdateSubmit)} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t("product_name")}</label>
                <input
                  type="text"
                  value={editProduct.product_name || "N/A"}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-5 py-4 text-slate-500 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t("quantity")}</label>
                  <input
                    type="number"
                    {...register("quantity")}
                    min="1"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t("unit_price")}</label>
                  <input
                    type="number"
                    {...register("unit_price")}
                    min="1"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t("status")}</label>
                <select
                  {...register("status")}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold appearance-none"
                >
                  <option value="Done">{t("done")}</option>
                  <option value="Cancelled">{t("cancelled")}</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 h-14 font-bold"
                  onClick={() => setEditProduct(null)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-2xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white h-14 font-bold shadow-xl shadow-slate-900/10 dark:shadow-none"
                >
                  {t("update")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
              {/* <div 
                className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden border border-blue-100/50 dark:border-blue-800 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(selectedItem.product_image)}
              >
                {selectedItem.product_image ? (
                  <img src={getImageUrl(selectedItem.product_image)} alt={selectedItem.product_name} className="w-full h-full object-cover" />
                ) : (
                  <Eye className="h-6 w-6" />
                )}
              </div> */}
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{t("item_detail")}</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{t("product_name")}</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{selectedItem.product_name || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{t("quantity")}</p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{selectedItem.quantity}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{t("price")}</p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {formatCurrency(selectedItem.total_price ? selectedItem.total_price : selectedItem.price)}
                  </p>
                </div>
              </div>
              <Button
                className="w-full rounded-2xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white h-14 font-bold shadow-lg mt-2"
                onClick={() => setSelectedItem(null)}
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmationModal(false)}>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 text-center">
              <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
                <Layers className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                {t("confirm_update")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">{t("do_you_to_update")}</p>
            </div>
            <div className="p-8 flex gap-4">
              <Button
                onClick={() => setShowConfirmationModal(false)}
                className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 h-14 font-bold"
              >
                {t("no")}
              </Button>
              <Button
                onClick={handleConfirmUpdate}
                className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white h-14 font-bold shadow-xl shadow-emerald-600/20"
              >
                {t("yes")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isImageModalOpen && (
        <ImageModal imageUrl={selectedImage} onClose={closeImageModal} />
      )}
    </div>
  );
};

export default OrderDetailPage;
