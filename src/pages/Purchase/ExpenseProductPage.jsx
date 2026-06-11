import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@/components/ui/button";
import Pagination from "@mui/material/Pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import UpdateExpenseProductModal from "./UpdateExpenseProductModal";
import { formatCurrency } from "@/utils/numberFormaterStats";

const ExpenseProductPage = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isConfirmDeleteProductOpen, setIsConfirmDeleteProductOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  // Fetch expense products
  const { data, error, isLoading } = useQuery({
    queryKey: ["ExpenseProducts", expenseId],
    queryFn: fetchExpenseProducts,
    enabled: !!expenseId,
  });

  async function fetchExpenseProducts() {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.PURCHASE_EXPENSES}${expenseId}`
    );
    return response?.data;
  }

  const products = data?.products || [];
  const selectedProductStatus = data?.payment_status;

  // Sort products by id in descending order
  const sortedProducts = [...products].sort((a, b) => b.id - a.id);

  // Calculate pagination
  const pageCount = Math.ceil(sortedProducts.length / itemsPerPage);
  const displayProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const productColumns = [
    { field: "id", headerName: t("id"), width: 70 },
    { field: "product", headerName: t("products"), width: 150 },
    { field: "unit", headerName: t("unit"), width: 100 },
    { field: "description", headerName: t("description"), width: 150 },
    { field: "unit_price", headerName: t("unit_price"), width: 150 },
    { field: "quantity", headerName: t("quantity"), width: 100 },
    { field: "total_price", headerName: t("total_price"), width: 150 },
    {
      field: "actions",
      headerName: t("actions"),
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">Open actions menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => handleView(params.row)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4 text-yellow-600" />
              {t("update_product")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteProduct(params.row.id)}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleDeleteProduct = (productId) => {
    setProductToDelete(productId);
    setIsConfirmDeleteProductOpen(true);
  };

  const confirmDeleteProduct = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.PURCHASE_PRODUCTS}${productToDelete}`);
      toast.success("Product deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["ExpenseProducts"] });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete the product.");
    } finally {
      setIsDeleting(false);
      setIsConfirmDeleteProductOpen(false);
    }
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setIsUpdateProductModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">

        <h1 className="text-lg font-bold">{t("products")}</h1>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          onClick={() => navigate(`/add-expense-product/${expenseId}`)}
          disabled={selectedProductStatus === "Paid"}
          className="p-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
        >
          {t("add_product")}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">{t("loading")}...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">Failed to load products.</div>
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
              rows={displayProducts}
              columns={productColumns}
              pageSize={itemsPerPage}
              rowsPerPageOptions={[itemsPerPage]}
              getRowId={(row) => row.id}
              disableSelectionOnClick
            />
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {displayProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3 pb-3 border-b">
                  <div>
                    <h3 className="text-sm text-gray-900">#{product.id}</h3>
                    <p className="text-base font-bold mt-1">{product.product || "N/A"}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleView(product)}>
                        <Edit className="mr-2 h-4 w-4" />{t("update_product")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />{t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("unit")}</span>
                    <span className="font-medium text-gray-900">{product.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("unit_price")}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(product.unit_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("quantity")}</span>
                    <span className="font-medium text-gray-900">{product.quantity}</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                    <span className="text-gray-700 font-medium">{t("total_price")}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(product.total_price)}</span>
                  </div>
                  {product.description && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("description")}</span>
                      <span className="font-medium text-gray-900">{product.description}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination
            count={pageCount}
            variant="outlined"
            page={currentPage}
            onChange={handlePageChange}
            className="mt-4 flex justify-center"
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteProductOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
          onClick={() => setIsConfirmDeleteProductOpen(false)}
        >
          <div
            className="bg-white p-5 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-bold text-2xl border-b p-1">
              {t("are_you_sure")}
            </h2>
            <p>{t("sure_discription_product")}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              >
                {isDeleting ? "Deleting..." : t("delete")}
              </Button>
              <Button
                onClick={() => setIsConfirmDeleteProductOpen(false)}
                disabled={isDeleting}
                className="bg-[#913030] hover:bg-[#b35a5a] text-white px-4 py-2 rounded-md"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Product Modal */}
      <UpdateExpenseProductModal
        isUpdateProductModalOpen={isUpdateProductModalOpen}
        setIsUpdateProductModalOpen={setIsUpdateProductModalOpen}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default ExpenseProductPage;