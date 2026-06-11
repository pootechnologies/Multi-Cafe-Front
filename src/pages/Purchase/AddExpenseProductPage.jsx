import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { Trash, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";

const AddExpenseProductPage = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [formDataList, setFormDataList] = useState([
    {
      product: "",
      unit: "",
      description: "",
      quantity: "",
      unitPrice: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: expenseDetailsList, isLoading: isLoadingExpenseDetails } = useQuery({
    queryKey: ["expenseDetailsList", expenseId],
    queryFn: () =>
      axiosInstance
        .get(`${API_ENDPOINTS.PURCHASE_EXPENSES}${expenseId}`)
        .then((res) => res.data),
    enabled: !!expenseId,
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (updatedProducts) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.PURCHASE_EXPENSES}${expenseId}`,
        updatedProducts
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
      queryClient.invalidateQueries({ queryKey: ["ExpenseProducts"] });
      queryClient.invalidateQueries({ queryKey: ["expenseDetailsList"] });
      toast.success("Products added successfully!");
      navigate(`/expense-products/${expenseId}`);
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error("Failed to add products.");
      console.error("Error adding products:", error);
      setIsSubmitting(false);
    },
  });

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    for (let i = 0; i < formDataList.length; i++) {
      const formData = formDataList[i];
      if (!formData.product.trim()) {
        toast.error(`Product name is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
      if (!formData.quantity || formData.quantity <= 0) {
        toast.error(`Valid quantity is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
      if (!formData.unitPrice || formData.unitPrice <= 0) {
        toast.error(`Valid unit price is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
    }

    const newProducts = formDataList.map((formData) => ({
      product: formData.product,
      unit: formData.unit,
      description: formData.description,
      quantity: formData.quantity,
      unit_price: parseFloat(formData.unitPrice) || 0,
    }));

    const updatedExpense = {
      ...expenseDetailsList,
      products: [...expenseDetailsList.products, ...newProducts],
    };

    mutation.mutate(updatedExpense);
  };

  const calculateTotalPrice = (quantity, unitPrice) => {
    const quantityValue = parseFloat(quantity) || 0;
    const unitPriceValue = parseFloat(unitPrice) || 0;
    return (quantityValue * unitPriceValue).toFixed(2);
  };

  return (
    <div className="p-6 w-[90%] lg:max-w-4xl">

      <div className="bg-white rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">{t("add_products")}</h2>
        </div>

        <div className="space-y-6 overflow-y-auto">
          {formDataList.map((formData, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={`product-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("product_name")}
                  </label>
                  <input
                    type="text"
                    id={`product-${index}`}
                    name="product"
                    value={formData.product}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor={`unit-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("unit")}
                  </label>
                  <input
                    type="text"
                    id={`unit-${index}`}
                    name="unit"
                    value={formData.unit}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`description-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("description")}
                  </label>
                  <input
                    type="text"
                    id={`description-${index}`}
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`quantity-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("quantity")}
                  </label>
                  <input
                    type="number"
                    id={`quantity-${index}`}
                    name="quantity"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`unit-price-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("unit_price")}
                  </label>
                  <input
                    type="number"
                    id={`unit-price-${index}`}
                    name="unitPrice"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              {formDataList.length > 1 && (
                <div className="flex justify-end mt-4">
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
                    type="button"
                    onClick={() => handleRemove(index)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    {t("remove")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <Button
            type="button"
            onClick={handleAddMore}
            className="p-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
          >
            {t("add_more")}
          </Button>

          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-[#55B990] hover:bg-[#54ce9b] disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : t("submit")}
            </Button>
            <Button
              type="button"
              onClick={() => navigate(`/expense-products/${expenseId}`)}
              variant="destructive"
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseProductPage;