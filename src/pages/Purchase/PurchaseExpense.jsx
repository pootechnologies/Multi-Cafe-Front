import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Eye, Trash, Pencil, ScrollText, MoreVertical, ChevronDown, ChevronUp } from "lucide-react";
import Pagination from "@mui/material/Pagination";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import useSupplierStore from "../../store/useSupplierStore";
import { toast } from "react-hot-toast";
import SupplierLogModal from "./SupplierLogModal";
import { t } from "i18next";
import SearchSupplier from "./SearchSupplier";

const PurchaseExpense = () => {
  const navigate = useNavigate();
  const setSelectedSupplier = useSupplierStore(
    (state) => state.setSelectedSupplier
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSupplier, setSelectedSupplierName] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["purchaseExpenses"],
    queryFn: () =>
      axiosInstance
        .get(API_ENDPOINTS.PURCHASE_SUPPLIERS)
        .then((res) => res?.data?.results),
  });

  useEffect(() => {
    if (Array.isArray(data)) {
      const sortedData = [...data].sort((a, b) => b.id - a.id);
      setFilteredData(sortedData);
    } else {
      setFilteredData([]);
    }
  }, [data]);

  useEffect(() => {
    if (selectedSupplier) {
      if (selectedSupplier.value === "all") {
        if (Array.isArray(data)) {
          const sortedData = [...data].sort((a, b) => b.id - a.id);
          setFilteredData(sortedData);
        } else {
          setFilteredData([]);
        }
      } else {
        if (Array.isArray(data)) {
          const filtered = data.filter(
            (item) => item.supplier_name === selectedSupplier.value
          );
          setFilteredData(filtered);
        } else {
          setFilteredData([]);
        }
      }
    } else {
      if (Array.isArray(data)) {
        const sortedData = [...data].sort((a, b) => b.id - a.id);
        setFilteredData(sortedData);
      } else {
        setFilteredData([]);
      }
    }
  }, [selectedSupplier, data]);

  const queryClient = useQueryClient();

  const handleDeleteClick = (id) => {
    setSupplierToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteSupplier = async () => {
    try {
      const res = await axiosInstance.delete(
        `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${supplierToDelete}`
      );
      if (res.status === 200) {
        toast.success("Supplier deleted successfully!");
        await queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
      } else {
        toast.error("Unexpected response while deleting supplier.");
      }
    } catch (err) {
      toast.error("Failed to delete supplier!");
      console.error(err);
    } finally {
      setIsConfirmDeleteOpen(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const id = selectedRow.id;
      const updatedData = {
        ...selectedRow,
        payment_status: paymentStatus,
      };
      const res = await axiosInstance.patch(
        `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${id}`,
        updatedData
      );
      if (res.status === 200) {
        toast.success("Supplier updated successfully!");
        setModalOpen(false);
        await queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
        await queryClient.refetchQueries({
          queryKey: ["supplierLogs", selectedRow?.id],
        });
      } else {
        toast.error("Unexpected response while updating supplier.");
      }
    } catch (err) {
      toast.error("Failed to update supplier!");
      console.error(err);
    }
  };

  const handleOpenLogModal = () => {
    setIsLogModalOpen(true);
  };

  const columns = [
    { field: "id", headerName: t("id"), width: 70 },
    { field: "supplier_name", headerName: t("supplier"), width: 200 },
    { field: "total_amount", headerName: t("total_amount"), width: 150 },
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
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                setSelectedRow(params.row);
                setPaymentStatus(params.row.payment_status);
                setPaidAmount(params.row.paid_amount);
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
                handleOpenLogModal();
              }}
              className="flex items-center gap-2"
            >
              <ScrollText className="w-4 h-4 text-blue-600" />
              {t("logs")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedSupplier(params.row);
                navigate("/expense-detail");
              }}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-green-600" />
              {t("view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                handleDeleteClick(params.row.id);
              }}
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

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching data: {error.message}</div>;

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const displayData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container">
      <h1 className="px-4 font-bold mt-4 mb-2 border-b p-1">
        {t("manage_purchase_suppliers")}
      </h1>
      <SearchSupplier onSupplierSelect={setSelectedSupplierName} />

      {/* Desktop View */}
      <div style={{ height: "auto", width: "100%" }} className="p-4 hidden md:block">
        <DataGrid
          sx={{
            "& .MuiDataGrid-footerContainer": { display: "none" },
            "& .MuiDataGrid-scrollbar--horizontal": {
              display: "scroll",
              zIndex: 0,
            },
          }}
          rows={displayData}
          columns={columns}
          pageSize={itemsPerPage}
          rowCount={filteredData.length}
          paginationMode="server"
          getRowId={(row) => row.id}
        />
        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          className="mt-4 flex justify-center"
        />
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3 p-4">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          displayData?.map((supplier) => (
            <div key={supplier.id} className={`bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all ${Object.values(expandedCards).some(v => v) && !expandedCards[supplier.id] ? 'opacity-40 blur-sm' : ''}`}>
              <div className="flex justify-between items-start mb-3 pb-3 border-b">
                <div>
                  <h3 className=" text-sm text-gray-900">#{supplier.id}</h3>
                  <p className="text-base font-bold  mt-1">{supplier.supplier_name || "N/A"}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setSelectedRow(supplier); setPaymentStatus(supplier.payment_status); setPaidAmount(supplier.paid_amount); setModalOpen(true); }}>
                      <Pencil className="mr-2 h-4 w-4" />{t("update_status")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSelectedRow(supplier); handleOpenLogModal(); }}>
                      <ScrollText className="mr-2 h-4 w-4" />{t("logs")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSelectedSupplier(supplier); navigate("/expense-detail"); }}>
                      <Eye className="mr-2 h-4 w-4" />{t("view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(supplier.id)} className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />{t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                  <span className="text-gray-700 font-medium">{t("total_amount")}</span>
                  <span className="font-bold text-gray-900">{supplier.total_amount} ETB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("payment_status")}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: supplier.payment_status === "Paid" ? "#10b981" : supplier.payment_status === "Pending" ? "#f59e0b" : "#ef4444", backgroundColor: supplier.payment_status === "Paid" ? "#d1fae5" : supplier.payment_status === "Pending" ? "#fef3c7" : "#fee2e2" }}>
                    {supplier.payment_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("user")}</span>
                  <span className="font-medium text-gray-900">{supplier.user}</span>
                </div>
              </div>

              <button
                onClick={() => setExpandedCards(prev => {
                  const isCurrentlyExpanded = prev[supplier.id];
                  return isCurrentlyExpanded ? {} : { [supplier.id]: true };
                })}
                className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {expandedCards[supplier.id] ? (
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

              {expandedCards[supplier.id] && (
                <div className="mt-3 pt-3 border-t space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("paid_amount")}</span>
                    <span className="font-medium text-green-600">{supplier.paid_amount} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("unpaid_amount")}</span>
                    <span className="font-medium text-red-600">{supplier.unpaid_amount} ETB</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          className="mt-4 flex justify-center"
        />
      </div>

      {/* Update Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ ...modalStyle }} className="w-[85%] md:w-[35%] rounded-md">
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
          <div className="flex justify-end">
            <Button
              className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
              onClick={handleUpdate}
            >
              {t("update_status")}
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
          onClick={() => setIsConfirmDeleteOpen(false)}
        >
          <div
            className="bg-white p-5 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-bold text-2xl border-b p-1">
              {t("are_you_sure")}
            </h2>
            <p>{t("sure_discription_supplier")}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={confirmDeleteSupplier}
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              >
                {t("delete")}
              </Button>
              <Button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="bg-[#913030] hover:bg-[#b35a5a] text-white px-4 py-2 rounded-md"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Log Modal */}
      <SupplierLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        selectedRow={selectedRow}
      />
    </div>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default PurchaseExpense;
