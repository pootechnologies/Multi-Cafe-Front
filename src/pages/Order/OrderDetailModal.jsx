import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Pencil, Trash2, Plus, Hash, ShoppingCart, ChevronLeft, ChevronRight, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";

const fetchOrderDetails = async (selectedOrderId) => {
  const response = await axiosInstance.get(
    `${API_ENDPOINTS.ORDERS}/${selectedOrderId}`
  );
  return response.data;
};

const OrderDetailModal = ({
  isOpen,
  onClose,
  modalItemsPerPage,
  modalPageCount,
  modalCurrentPage,
  handleModalPageChange,
  showDeleteModal,
  setShowDeleteModal,
  handleConfirmDelete,
  handleAddOrderClick,
  showItemDetails,
  setEditProduct,
  handleDeleteSubmit,
  t,
  selectedOrderId,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orderDetails", selectedOrderId],
    queryFn: () => fetchOrderDetails(selectedOrderId),
    enabled: !!selectedOrderId && isOpen,
  });

  if (!isOpen) return null;
  if (isError) return <div className="p-8 text-rose-500 font-bold">Error fetching order details</div>;

  const sortedData = [...(data?.data?.items || [])].sort((a, b) => b.id - a.id);
  const startIndex = (modalCurrentPage - 1) * modalItemsPerPage;
  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + modalItemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / modalItemsPerPage);

  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{t("order_details")}</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Order ID: <span className="text-slate-900 dark:text-slate-100 font-bold">#{selectedOrderId}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAddOrderClick}
              className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white rounded-xl h-11 px-6 font-bold flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Order
            </Button>
            <button 
              onClick={onClose}
              className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading details...</p>
            </div>
          ) : sortedData.length === 0 ? (
            <div className="p-20 text-center text-slate-500 font-bold">No items found for this order.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100/80 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest">{t("id")}</th>
                    <th className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest">{t("product_name")}</th>
                    <th className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest">{t("package")}</th>
                    <th className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest">{t("quantity")}</th>
                    <th className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest">{t("item_price")}</th>
                    <th className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest">{t("total_price")}</th>
                    <th className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest">{t("status")}</th>
                    <th className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-8 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px] border border-slate-200/60 dark:border-slate-700/60">
                          <Hash className="h-2.5 w-2.5 mr-1 text-slate-400" />
                          {item.id}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm whitespace-nowrap">
                          {item.product_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {item.package || 0}
                      </td>
                      <td className="px-8 py-4 text-sm font-black text-slate-900 dark:text-slate-100">
                        {item.quantity}
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                        {formatCurrency(item.unit_price ? item.unit_price : item.product_price)}
                      </td>
                      <td className="px-8 py-4 text-sm font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {formatCurrency(item.total_price ? item.total_price : item.price)}
                      </td>
                      <td className="px-8 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm ${
                          item.status === "Done" 
                            ? "bg-emerald-600 dark:bg-emerald-500" 
                            : item.status === "Pending"
                            ? "bg-amber-500 dark:bg-amber-400"
                            : "bg-rose-600 dark:bg-rose-500"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-9 w-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all flex items-center justify-center">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-2xl z-[110]">
                            <DropdownMenuItem
                              onClick={() => showItemDetails(item)}
                              className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                              {t("view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setEditProduct(item)}
                              className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
                            >
                              <Pencil className="h-4 w-4 text-amber-500" />
                              {t("update")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteSubmit(item.id)}
                              className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
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
          )}
        </div>

        {/* Modal Footer / Pagination */}
        {!isLoading && sortedData.length > 0 && (
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Page <span className="text-slate-900 dark:text-slate-100 font-bold">{modalCurrentPage}</span> of <span className="text-slate-900 dark:text-slate-100 font-bold">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => handleModalPageChange(null, Math.max(1, modalCurrentPage - 1))}
                disabled={modalCurrentPage === 1}
                variant="outline"
                className="h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button 
                onClick={() => handleModalPageChange(null, Math.min(totalPages, modalCurrentPage + 1))}
                disabled={modalCurrentPage >= totalPages}
                variant="outline"
                className="h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <Button
              className="w-full sm:w-32 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 h-10 font-bold"
              onClick={onClose}
            >
              {t("close")}
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Modal - Modernized */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowDeleteModal(false)}>
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{t("are_you_sure")}</h2>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t("sure_discription")}</p>
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 h-14 font-bold"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white h-14 font-bold shadow-xl shadow-rose-600/10"
                >
                  {t("delete")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailModal;
