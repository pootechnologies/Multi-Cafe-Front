import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { useQueryClient } from "@tanstack/react-query";

const AddPerformaProductsPage = () => {
  const { t } = useTranslation();
  const { performaId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [items, setItems] = useState([
    { product_name: "", unit: "", quantity: 1, unitPrice: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product_name.trim()) {
        toast.error(`Product name is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
      if (!item.quantity || item.quantity < 1) {
        toast.error(`Valid quantity is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        toast.error(`Valid unit price is required for item ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
    }

    const newPerformaItems = items.map((item) => ({
      product: item.product_name,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    try {
      // First fetch current performa data
      const currentResponse = await axiosInstance.get(
        `${API_ENDPOINTS.PERFORMA_PERFORMAS}${performaId}`
      );

      const currentPerforma = currentResponse.data.data;
      const updatedPerforma = {
        ...currentPerforma,
        products: [...currentPerforma.products, ...newPerformaItems],
      };

      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.PERFORMA_PERFORMAS}${performaId}`,
        updatedPerforma
      );

      if (response.status === 200) {
        toast.success("Performa items added successfully!");
        queryClient.invalidateQueries(["performaDetailItems", performaId]);
        navigate(`/performa-detail-products/${performaId}`);
      }
    } catch (error) {
      console.error("Error updating performa items:", error);
      toast.error("Failed to update performa items.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 w-[90%] lg:max-w-4xl">
     
      <div className="bg-white rounded-lg  ">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t("add_products")}</h2>

        </div>

        <div className="space-y-6 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={`product_name-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("product_name")}
                  </label>
                  <input
                    type="text"
                    id={`product_name-${index}`}
                    value={item.product_name}
                    onChange={(e) => handleProductNameChange(index, e)}
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
                    value={item.unit}
                    onChange={(e) => handleUnitChange(index, e)}
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
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, e)}
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
                    step="0.01"
                    min="0.01"
                    required
                    value={item.unitPrice}
                    onChange={(e) => handleUnitPriceChange(index, e)}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              {items.length > 1 && (
                <div className="flex justify-end mt-4">
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
                    type="button"
                    onClick={() => removeItem(index)}
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
            onClick={addItem}
            className="p-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"

          >
            {t("add_more")}
          </Button>

          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={handleAddPerforma}
              className="bg-[#55B990] hover:bg-[#54ce9b] disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : t("submit")}
            </Button>
            <Button
              type="button"
              onClick={() => navigate(`/performa-detail-products/${performaId}`)}
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

export default AddPerformaProductsPage;