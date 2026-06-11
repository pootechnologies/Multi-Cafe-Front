import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import axiosInstance from "axiosInstance";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const AddPerformaModal = ({
  isOpen,
  onClose,
  performaItems,
  setPerformaItems,
  id,
}) => {
  const { control, handleSubmit, setValue, reset } = useForm();
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([
    { selectedProduct: null, unit: "", quantity: 1, unitPrice: "" },
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.PRODUCTS
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const queryClient = useQueryClient();

  const handleProductChange = (index, selectedOption) => {
    const newItems = [...items];
    newItems[index].selectedProduct = selectedOption.value;
    newItems[index].unit = selectedOption.value.unit;
    newItems[index].unitPrice = selectedOption.value.selling_price;
    setItems(newItems);
  };

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

  const addItem = () => {
    setItems([
      ...items,
      { selectedProduct: null, unit: "", quantity: 1, unitPrice: "" },
    ]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const onSubmit = async () => {
    const newPerformaItems = items.map((item) => ({
      product_name: item.selectedProduct.name,
      product: item.selectedProduct.id,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }));

    const updatedPerformaItems = [...performaItems, ...newPerformaItems];

    try {
      const payload = {
        items: updatedPerformaItems,
      };

      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.PERFORMA}${id}/`,
        payload
      );

      if (response.status === 200) {
        toast.success("Performa items Added successfully!");
        queryClient.invalidateQueries({ queryKey: ["performaDetailItems"] });
        onClose();
        reset();
        setItems([
          { selectedProduct: null, unit: "", quantity: 1, unitPrice: "" },
        ]);
      }
    } catch (error) {
      console.error("Error updating performa items:", error);
      toast.error("Failed to update performa items.");
    }
  };

  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] lg:max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg shadow-lg">
        <div className="p-8">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-300">
              {t("add_performa")}
            </h2>
            <p className="text-sm text-gray-500">
              {items.length} {t("products")}
            </p>
          </div>
          <div className="h-[50vh] overflow-auto">
            {items.map((item, index) => (
              <div key={index} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor={`product-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("products")}
                  </label>
                  <Select
                    id={`product-${index}`}
                    value={
                      item.selectedProduct
                        ? {
                            label: item.selectedProduct.name,
                            value: item.selectedProduct,
                          }
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleProductChange(index, selectedOption)
                    }
                    options={products.map((product) => ({
                      label: product.name,
                      value: product,
                    }))}
                    placeholder={t("select_product")}
                    className="w-full"
                  />
                </div>
                {item.selectedProduct && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label
                        htmlFor={`unit-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("unit")}
                      </label>
                      <input
                        type="text"
                        id={`unit-${index}`}
                        value={item.unit}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].unit = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor={`quantity-${index}`}
                        className="block text-sm font-medium text-gray-700"
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
                    <div className="space-y-2">
                      <label
                        htmlFor={`unit-price-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("unit_price")}
                      </label>
                      <input
                        type="number"
                        id={`unit-price-${index}`}
                        value={item.unitPrice}
                        onChange={(e) => handleUnitPriceChange(index, e)}
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  {items.length > 1 && (
                    <Button type="button" onClick={() => removeItem(index)}>
                      <Trash className="mr-3" />
                      {t("remove")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-row justify-between mt-4">
            <Button
              type="button"
              onClick={addItem}
              className="bg-green-500 text-white px-4 py-2 rounded-md "
            >
              {t("add_more")}
            </Button>
            <div className="">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
              >
                {t("cancel")}
              </Button>
              <Button
                type="button"
                onClick={onSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                {t("submit")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPerformaModal;
