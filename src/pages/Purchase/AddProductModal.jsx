import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { Modal, Box, Typography, TextField } from "@mui/material";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

const AddProductModal = ({ isOpen, onClose, selectedProducts }) => {
  const normalizedSelectedProducts = Array.isArray(selectedProducts)
    ? selectedProducts
    : selectedProducts
      ? [selectedProducts]
      : [];

  const [formDataList, setFormDataList] = useState([
    {
      product: "",
      unit: "",
      description: "",
      quantity: "",
      unitPrice: "",
    },
  ]);

  const { data: expenseDetailsList, isLoading: isLoadingExpenseDetails } = useQuery({
    queryKey: ["expenseDetailsList", selectedProducts.id],
    queryFn: () =>
      axiosInstance
        .get(`${API_ENDPOINTS.PURCHASE_EXPENSES}${selectedProducts.id}`)
        .then((res) => res.data),
    enabled: !!selectedProducts.id && isOpen,
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (updatedProducts) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.PURCHASE_EXPENSES}${selectedProducts.id}`,
        updatedProducts[0]
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
      queryClient.invalidateQueries({ queryKey: ["ExpenseProducts"] });
      queryClient.invalidateQueries({ queryKey: ["expenseDetailsList"] });
      toast.success("Products updated successfully!");
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to update products.");
      console.error("Error updating products:", error);
    },
  });

  const resetForm = () => {
    setFormDataList([
      {
        product: "",
        unit: "",
        description: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newFormDataList = [...formDataList];
    newFormDataList[index][name] = value;
    setFormDataList(newFormDataList);
  };

  const handleAddMore = () => {
    setFormDataList([
      ...formDataList,
      {
        product: "",
        unit: "",
        description: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const handleRemove = (index) => {
    const newFormDataList = [...formDataList];
    newFormDataList.splice(index, 1);
    setFormDataList(newFormDataList);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedProducts = normalizedSelectedProducts.map(
      (selectedProduct) => {
        const newProducts = formDataList.map((formData) => ({
          product: formData.product,
          unit: formData.unit,
          description: formData.description,
          quantity: formData.quantity,
          unit_price: parseFloat(formData.unitPrice) || 0,
        }));

        return {
          ...expenseDetailsList,
          products: [...expenseDetailsList.products, ...newProducts],
        };
      }
    );

    mutation.mutate(updatedProducts);
  };

  const calculateTotalPrice = (quantity, unitPrice) => {
    const quantityValue = parseFloat(quantity) || 0;
    const unitPriceValue = parseFloat(unitPrice) || 0;
    return (quantityValue * unitPriceValue).toFixed(2);
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", md: "50%" },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxHeight: "80vh",
          overflowY: "auto",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {t("add_product")}
        </Typography>

        <form onSubmit={handleSubmit}>
          {formDataList.map((formData, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: 2,
                my: 2,
              }}
            >
              <TextField
                label={t("product_name")}
                name="product"
                value={formData.product}
                onChange={(e) => handleChange(index, e)}
                fullWidth
                margin="normal"
                required
              />

              <TextField
                label={t("unit")}
                name="unit"
                value={formData.unit}
                onChange={(e) => handleChange(index, e)}
                fullWidth
                margin="normal"
              />

              <TextField
                label={t("description")}
                name="description"
                value={formData.description}
                onChange={(e) => handleChange(index, e)}
                fullWidth
                margin="normal"
              />

              <TextField
                label={t("quantity")}
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange(index, e)}
                fullWidth
                margin="normal"
                required
              />

              <TextField
                label={t("unit_price")}
                name="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => handleChange(index, e)}
                fullWidth
                margin="normal"
                required
              />

              <TextField
                label={t("total_price")}
                value={calculateTotalPrice(
                  formData.quantity,
                  formData.unitPrice
                )}
                fullWidth
                margin="normal"
                disabled
              />

              {formDataList.length > 1 && (
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                  >
                    <Trash className="mr-2" /> {t("remove")}
                  </Button>
                </div>
              )}
            </Box>
          ))}

          {/* LEFT: Add More | RIGHT: Submit + Cancel */}
          <Box className="flex justify-between items-center mt-4">
            {/* LEFT SIDE */}
            <Button className="bg-black" type="button" onClick={handleAddMore}>
              {t("add_more")}
            </Button>

            {/* RIGHT SIDE */}
            <Box className="flex gap-2">
              <Button
                className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
                type="submit"
              >
                {t("submit")}
              </Button>

              <Button
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                onClick={handleClose}
              >
                {t("cancel")}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddProductModal;
