import React, { useState } from "react";
import { Modal, Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@/components/ui/button";
import Pagination from "@mui/material/Pagination";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";

const ExpenseProductModal = ({
  modalOpenExpense,
  setModalOpenExpense,
  setIsAddProductModalOpen,
  productColumns,
  selectedProducts,
}) => {
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const itemsPerPage = 5; // You can adjust this value as needed
  const selectedExpenseId = selectedProducts?.id;
  const selectedProductStatus = selectedProducts?.payment_status;

  // Fetch expense products
  const { data, error, isLoading } = useQuery({
    queryKey: ["ExpenseProducts", selectedExpenseId],
    queryFn: fetchExpenseProducts,
    enabled: !!selectedExpenseId,
  });

  async function fetchExpenseProducts() {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.PURCHASE_EXPENSES}${selectedExpenseId}`
    );
    return response?.data;
  }

  // Calculate the total number of pages
  const productPageCount = Math.ceil(
    (data?.products?.length || 0) / itemsPerPage
  );

  // Handle page change
  const handleProductsPageChange = (event, page) => {
    setCurrentProductsPage(page);
  };

  // Sort products by id in descending order and then slice for pagination
  const sortedProducts = [...(data?.products || [])].sort(
    (a, b) => b.id - a.id
  );

  const currentPageProducts = sortedProducts.slice(
    (currentProductsPage - 1) * itemsPerPage,
    currentProductsPage * itemsPerPage
  );

  return (
    <Modal
      open={modalOpenExpense}
      onClose={() => setModalOpenExpense(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ zIndex: 10 }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
        }}
        className="w-[90%] md:w-[50%] rounded-md"
      >
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {t("products")}
        </Typography>
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setIsAddProductModalOpen(true)}
            disabled={selectedProductStatus === "Paid"}
          >
            {t("add_product")}
          </Button>
        </div>
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">Failed to load products.</Typography>
        ) : (
          <div style={{ height: "auto", width: "100%" }}>
            <DataGrid
              sx={{
                "& .MuiDataGrid-footerContainer": { display: "none" },
                "& .MuiDataGrid-scrollbar--horizontal": {
                  display: "scroll",
                  zIndex: 0,
                },
              }}
              rows={currentPageProducts}
              columns={productColumns}
              pageSize={itemsPerPage}
              rowsPerPageOptions={[itemsPerPage]}
              getRowId={(row) => row.id}
            />
            <Pagination
              count={productPageCount}
              variant="outlined"
              page={currentProductsPage}
              onChange={handleProductsPageChange}
              className="mt-4 flex justify-center"
            />
          </div>
        )}
      </Box>
    </Modal>
  );
};

export default ExpenseProductModal;
