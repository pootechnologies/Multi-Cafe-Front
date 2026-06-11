import React from "react";
import { Modal, Box, Typography, TextField } from "@mui/material";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { t } from "i18next";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 4,
  p: 4,
};

const UpdateExpenseProductModal = ({
  isUpdateProductModalOpen,
  setIsUpdateProductModalOpen,
  selectedProduct,
  setSelectedProduct,
  formatCurrency,
}) => {
  const queryClient = useQueryClient();

  const handleUpdateProduct = async () => {
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.PURCHASE_PRODUCTS}${selectedProduct.id}`,
        selectedProduct
      );
      toast.success("Product updated successfully!");
      setIsUpdateProductModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
      await queryClient.invalidateQueries({ queryKey: ["ExpenseProducts"] });
    } catch (err) {
      toast.error("Failed to update product!");
      console.error(err);
    }
  };

  return (
    <Modal
      open={isUpdateProductModalOpen}
      onClose={() => setIsUpdateProductModalOpen(false)}
    >
      <Box
        sx={{ ...modalStyle }}
        className="w-[85%] md:w-[30%] lg:w-[40%] rounded-md"
      >
        <Typography variant="h6" component="h2">
          {t("update_product")}
        </Typography>
        {selectedProduct && (
          <>
            <TextField
              margin="normal"
              label={t("product")}
              fullWidth
              value={selectedProduct.product}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  product: e.target.value,
                })
              }
            />
            <TextField
              margin="normal"
              label={t("unit")}
              fullWidth
              value={selectedProduct.unit}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  unit: e.target.value,
                })
              }
            />
            <TextField
              margin="normal"
              label={t("description")}
              fullWidth
              value={selectedProduct.description}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  description: e.target.value,
                })
              }
            />
            <TextField
              margin="normal"
              label={t("unit_price")}
              type="number"
              fullWidth
              value={selectedProduct.unit_price}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  unit_price: e.target.value,
                })
              }
            />
            <TextField
              margin="normal"
              label={t("quantity")}
              type="number"
              fullWidth
              value={selectedProduct.quantity}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  quantity: e.target.value,
                })
              }
            />
            <TextField
              margin="normal"
              label={t("total_price")}
              fullWidth
              disabled
              value={formatCurrency(
                selectedProduct.quantity * selectedProduct.unit_price
              )}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleUpdateProduct}
                className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
              >
                {t("update")}
              </Button>
            </div>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default UpdateExpenseProductModal;
