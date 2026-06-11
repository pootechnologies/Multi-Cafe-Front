import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import toast from "react-hot-toast";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  CreditCard,
  DollarSign,
  Eye,
  MoreVertical,
  Pencil,
  ScrollText,
  Trash,
  User,
  Wallet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Pagination from "@mui/material/Pagination";
import "react-datepicker/dist/react-datepicker.css";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/numberFormaterStats";
import AddProductModal from "./AddProductModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { t } from "i18next";
import ExpenseLogModal from "./ExpenseLogModal";
import ExpenseProductModal from "./ExpenseProductModal";
import UpdateExpenseProductModal from "./UpdateExpenseProductModal";
import useSupplierStore from "@/store/useSupplierStore";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";

const ExpenseDetailPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [modalOpenExpense, setModalOpenExpense] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [expenseId, setExpenseId] = useState();
  const [isConfirmDeleteExpenseOpen, setIsConfirmDeleteExpenseOpen] = useState(false);
  const [isConfirmDeleteProductOpen, setIsConfirmDeleteProductOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const selectedSupplier = useSupplierStore((state) => state.selectedSupplier);
  const queryClient = useQueryClient();

  // Fetch supplier data (without date filter)
  const fetchSupplierData = async (page = 1) => {
    const url = `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${selectedSupplier?.id}?page=${page}`;
    const res = await axiosInstance.get(url);
    const supplierData = res.data;
    return supplierData;
  };

  // Query for supplier data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["purchaseSupplier", selectedSupplier?.id, currentPage],
    queryFn: () => fetchSupplierData(currentPage),
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
  });

  // Handle page change for expenses
  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle report click
  const handleReportClick = () => {
    const id = selectedSupplier?.id;
    navigate(`/supplier-report/${id}`);
  };

  // Open delete confirmation for expense
  const handleDeleteExpenseClick = (id) => {
    setExpenseToDelete(id);
    setIsConfirmDeleteExpenseOpen(true);
  };

  // Open delete confirmation for product
  const handleDeleteProductClick = (id) => {
    setProductToDelete(id);
    setIsConfirmDeleteProductOpen(true);
  };

  // Confirm delete expense
  const confirmDeleteExpense = async () => {
    try {
      await axiosInstance.delete(
        `${API_ENDPOINTS.PURCHASE_EXPENSES}${expenseToDelete}`
      );
      await refetch();
      toast.success("Expense deleted successfully!");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense.");
    } finally {
      setIsConfirmDeleteExpenseOpen(false);
    }
  };

  // Confirm delete product
  const confirmDeleteProduct = async () => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.PURCHASE_PRODUCTS}${productToDelete}`);
      toast.success("Product deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["purchaseSupplier"] });
      await refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete the product.");
    } finally {
      setIsConfirmDeleteProductOpen(false);
    }
  };

  // Columns for expenses DataGrid
  const expenseColumns = [
    { field: "id", headerName: t("id"), width: 70 },
    {
      field: "purchase_date",
      headerName: t("purchase_date"),
      width: 200,
      valueFormatter: (params) => formatDateTypeStamp(params),
    },
    { field: "total", headerName: t("total"), width: 150 },
    {
      field: "payment_status",
      headerName: t("payment_status"),
      width: 150,
      renderCell: (params) => {
        const status = params.value;
        let color = "";
        switch (status) {
          case "Paid":
            color = "green";
            break;
          case "Pending":
            color = "orange";
            break;
          case "Unpaid":
            color = "red";
            break;
          default:
            color = "gray";
        }
        return <span style={{ color, fontWeight: "bold" }}>{status}</span>;
      },
    },
    { field: "number_of_items", headerName: t("number_of_items"), width: 150 },
    { field: "paid_amount", headerName: t("paid_amount"), width: 150 },
    { field: "unpaid_amount", headerName: t("unpaid_amount"), width: 150 },
    { field: "user", headerName: t("user"), width: 100 },
    {
      field: "view",
      headerName: t("view"),
      width: 200,
      renderCell: (params) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">Open actions menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                setSelectedRow(params.row);
                setPaymentStatus(params.row.payment_status);
                setPaidAmount(params.row.paid_amount);
                setNewPaymentAmount("");
                setModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Pencil className="w-4 h-4 text-yellow-600" />
              {t("update_status")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedRow(params.row);
                setIsLogModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <ScrollText className="w-4 h-4 text-blue-600" />
              {t("logs")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigate(`/expense-products/${params.row.id}`);
              }}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-green-600" />
              {t("view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteExpenseClick(params.row.id)}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash className="w-4 h-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Columns for products DataGrid
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
              <Pencil className="w-4 h-4 text-yellow-600" />
              {t("update_product")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteProductClick(params.row.id)}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash className="w-4 h-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Navigate to add expense page
  const handleAddExpenseClick = () => {
    navigate(`/add-purchase/${selectedSupplier?.id}`);
  };

  // Submit add expense modal
  const handleSubmitAddModal = async (formattedData) => {
    try {
      await axiosInstance.post(
        `${API_ENDPOINTS.PURCHASE_SUPPLIERS}`,
        formattedData
      );
      await refetch();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense.");
    }
  };

  // Update payment status
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedData = {
        ...selectedRow,
        payment_status: paymentStatus,
        paid_amount: newPaymentAmount,
      };
      const res = await axiosInstance.patch(
        `${API_ENDPOINTS.PURCHASE_EXPENSES}${selectedRow.id}`,
        updatedData
      );
      if (res.status === 200) {
        toast.success("Supplier updated successfully!");
        setModalOpen(false);
        await queryClient.invalidateQueries({ queryKey: ["purchaseSupplier"] });
        await refetch();
      } else {
        toast.error("Unexpected response while updating supplier.");
      }
    } catch (err) {
      toast.error(err?.response?.data[0]);
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // View product
  const handleView = (product) => {
    setSelectedProduct(product);
    setIsUpdateProductModalOpen(true);
  };

  // Handle products page change
  const handleProductsPageChange = (event, pageNumber) => {
    setCurrentProductsPage(pageNumber);
  };

  // Data handling for expenses
  const expenses = data?.expenses?.results || [];
  const sortedExpenses = [...expenses].sort((a, b) => b.id - a.id);
  const pageCount = Math.ceil((data?.expenses?.count || 0) / itemsPerPage);

  // Data handling for products
  const products = selectedProducts.products || [];
  const sortedProducts = [...products].sort((a, b) => b.id - a.id);
  const displayProducts = sortedProducts.slice(
    (currentProductsPage - 1) * itemsPerPage,
    currentProductsPage * itemsPerPage
  );
  const productPageCount = Math.ceil(products.length / itemsPerPage);

  return (
    <div style={{ height: "auto", width: "100%" }}>
      <div className="container-padding">
        <h1 className="p-1 px-4 mt-4 mb-4 font-bold border-b">
          {t("expense_details")}
        </h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="cursor-pointer">
              <BreadcrumbLink onClick={() => navigate("/purchase_expense")}>
                <span className="px-4 mt-4 mb-4 font-bold">
                  {t("manage_purchase_suppliers")}
                </span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("expense_details")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {selectedSupplier && (
          <div className="px-4 py-4 mt-2 space-y-2 rounded-lg shadow-sm">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-lg font-bold text-gray-800">
                  {t("supplier")}:
                </span>
                <span className="font-medium text-gray-700">
                  {data?.data?.supplier_name}
                </span>
              </div>
              <div className="ml-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-800">
                    {t("total_amount")}:
                  </span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(data?.data?.total_amount)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-800">
                    {t("payment_status")}:
                  </span>
                  <span className="font-medium text-gray-700">
                    {data?.data?.payment_status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-800">
                    {t("paid_amount")}:
                  </span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(data?.data?.paid_amount)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-800">
                    {t("unpaid_amount")}:
                  </span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(data?.data?.unpaid_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-end mt-2 mb-2 space-x-5">
          <Button
            className="pt-2 mb-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
            onClick={handleAddExpenseClick}
          >
            {t("add_expense")}
          </Button>
          <Button
            onClick={handleReportClick}
            className="pt-2 mb-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
          >
            Report
          </Button>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <DataGrid
            sx={{
              "& .MuiDataGrid-footerContainer": { display: "none" },
              "& .MuiDataGrid-scrollbar--horizontal": {
                display: "scroll",
                zIndex: 1,
              },
            }}
            rows={sortedExpenses}
            columns={expenseColumns}
            disableSelectionOnClick
          />
          <Pagination
            count={pageCount}
            variant="outlined"
            color="primary"
            page={currentPage}
            onChange={handlePageChange}
            className="flex justify-center mt-4"
          />
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            sortedExpenses?.map((expense) => (
              <div key={expense.id} className={`bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all ${Object.values(expandedCards).some(v => v) && !expandedCards[expense.id] ? 'opacity-40 blur-sm' : ''}`}>
                <div className="flex justify-between items-start mb-3 pb-3 border-b">
                  <div>
                    <h3 className="text-sm text-gray-900">#{expense.id}</h3>
                    <p className="text-sm text-gray-600 mt-1">{formatDateTypeStamp(expense.purchase_date)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => { setSelectedRow(expense); setPaymentStatus(expense.payment_status); setPaidAmount(expense.paid_amount); setNewPaymentAmount(""); setModalOpen(true); }}>
                        <Pencil className="mr-2 h-4 w-4" />{t("update_status")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedRow(expense); setIsLogModalOpen(true); }}>
                        <ScrollText className="mr-2 h-4 w-4" />{t("logs")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { navigate(`/expense-products/${expense.id}`); }}>
                        <Eye className="mr-2 h-4 w-4" />{t("view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteExpenseClick(expense.id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />{t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                    <span className="text-gray-700 font-medium">{t("total")}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(expense.total)} ETB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t("payment_status")}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: expense.payment_status === "Paid" ? "#10b981" : expense.payment_status === "Pending" ? "#f59e0b" : "#ef4444", backgroundColor: expense.payment_status === "Paid" ? "#d1fae5" : expense.payment_status === "Pending" ? "#fef3c7" : "#fee2e2" }}>
                      {expense.payment_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("user")}</span>
                    <span className="font-medium text-gray-900">{expense.user}</span>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedCards(prev => {
                    const isCurrentlyExpanded = prev[expense.id];
                    return isCurrentlyExpanded ? {} : { [expense.id]: true };
                  })}
                  className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {expandedCards[expense.id] ? (
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

                {expandedCards[expense.id] && (
                  <div className="mt-3 pt-3 border-t space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("number_of_items")}</span>
                      <span className="font-medium text-gray-900">{expense.number_of_items}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("paid_amount")}</span>
                      <span className="font-medium text-green-600">{formatCurrency(expense.paid_amount)} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("unpaid_amount")}</span>
                      <span className="font-medium text-red-600">{formatCurrency(expense.unpaid_amount)} ETB</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <Pagination
            count={pageCount}
            variant="outlined"
            color="primary"
            page={currentPage}
            onChange={handlePageChange}
            className="flex justify-center mt-4"
          />
        </div>
      </div>

      {/* Delete Confirmation Modal for Expense */}
      {isConfirmDeleteExpenseOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
          onClick={() => setIsConfirmDeleteExpenseOpen(false)}
        >
          <div
            className="bg-white p-5 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-bold text-2xl border-b p-1">
              {t("are_you_sure")}
            </h2>
            <p>{t("sure_discription_expense")}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={confirmDeleteExpense}
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              >
                {t("delete")}
              </Button>
              <Button
                onClick={() => setIsConfirmDeleteExpenseOpen(false)}
                className="bg-[#913030] hover:bg-[#b35a5a] text-white px-4 py-2 rounded-md"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Product */}
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
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              >
                {t("delete")}
              </Button>
              <Button
                onClick={() => setIsConfirmDeleteProductOpen(false)}
                className="bg-[#913030] hover:bg-[#b35a5a] text-white px-4 py-2 rounded-md"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ExpenseProductModal
        selectedProducts={selectedProducts}
        modalOpenExpense={modalOpenExpense}
        setModalOpenExpense={setModalOpenExpense}
        setIsAddProductModalOpen={setIsAddProductModalOpen}
        productColumns={productColumns}
      />
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          refetch();
        }}
        selectedProducts={selectedProducts}
      />
      <UpdateExpenseProductModal
        isUpdateProductModalOpen={isUpdateProductModalOpen}
        setIsUpdateProductModalOpen={setIsUpdateProductModalOpen}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        formatCurrency={formatCurrency}
      />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ ...modalStyle, width: 400 }}>
          <Typography variant="h6" component="h2">
            {t("update_payment_status")}
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="payment-status-label">
              {t("payment_status")}
            </InputLabel>
            <Select
              labelId="payment-status-label"
              value={paymentStatus}
              label="Payment Status"
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <MenuItem value="Pending">{t("pending")}</MenuItem>
              <MenuItem value="Paid">{t("paid")}</MenuItem>
              <MenuItem value="Unpaid">{t("unpaid")}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            label={t("current_paid_amount")}
            type="text"
            fullWidth
            value={paidAmount}
            disabled
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            margin="normal"
            label={t("new_amount")}
            placeholder={t("new_amount")}
            type="number"
            fullWidth
            value={newPaymentAmount}
            onChange={(e) => setNewPaymentAmount(e.target.value)}
          />
          <Box
            mt={2}
            display="flex"
            justifyContent="flex-end"
            gap={2}
            alignItems="center"
          >
            <Button
              className="rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
              onClick={() => setModalOpen(false)}
              variant="outlined"
              color="secondary"
            >
              {t("cancel")}
            </Button>
            <Button
              className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
              onClick={handleUpdate}
              variant="contained"
              color="primary"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : t("save")}
            </Button>
          </Box>
        </Box>
      </Modal>
      <ExpenseLogModal
        open={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        selectedRow={selectedRow}
      />
    </div>
  );
};

// Modal style
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
};

export default ExpenseDetailPage;
