import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import ProductVariantsDisplay from "@/components/common/ProductVariantsDisplay";

const AddOrderModal = ({ isOpen, onClose, selectedOrderId, id }) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [productVariants, setProductVariants] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState([
    {
      selectedProduct: null,
      selectedVariant: null,
      unit: "",
      package: null,
      unit_price: "",
      quantity: null,
      stock: 0,
      disabledPackage: false,
      disabledQuantity: false,
    },
  ]);


  const { data: orderDetails = [], isLoading: isLoadingOrderDetails } =
    useQuery({
      queryKey: ["orderDetails", selectedOrderId],
      queryFn: () =>
        axiosInstance
          .get(`${API_ENDPOINTS.ORDERS}/${selectedOrderId}`)
          .then((res) => res.data),
      enabled: !!selectedOrderId && isOpen,
    });
  const orderItems = orderDetails?.data?.items;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`
        );
        const productsByName = response?.data?.all_results?.reduce(
          (acc, product) => {
            const existing = acc.find((p) => p.name === product.name);
            if (!existing) {
              acc.push({ ...product, variants: [] });
            }
            return acc;
          },
          []
        );
        const processedProducts = productsByName.map((product) => {
          const variants = response?.data?.all_results?.filter(
            (p) => p.name === product.name
          );
          const uniqueVariants = variants.reduce((acc, variant) => {
            if (!acc.some((v) => v.specification === variant.specification)) {
              acc.push({
                ...variant,
                variant_spec: variant.specification,
                variant_desc: variant.description,
              });
            }
            return acc;
          }, []);
          return { ...product, variants: uniqueVariants };
        });
        setProducts(processedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const handleProductChange = (index, selectedOption) => {
    const newItems = [...items];
    const selectedProduct = selectedOption ? selectedOption.value : null;
    newItems[index] = {
      ...newItems[index],
      selectedProduct: selectedProduct,
      unit: selectedProduct?.unit || "",
      unit_price: selectedProduct?.selling_price || "",
      stock: selectedProduct?.stock || 0,
      disabledQuantity: false,
      disabledPackage: false,
    };
    if (selectedProduct?.variants?.length > 0) {
      newItems[index].selectedVariant = selectedProduct.variants[0];
      newItems[index].unit_price = selectedProduct.variants[0].selling_price;
      newItems[index].stock = selectedProduct.variants[0].stock;
    } else {
      newItems[index].selectedVariant = null;
    }
    setItems(newItems);
    setSelectedProduct(selectedProduct);
    setSelectedVariant(selectedProduct?.variants?.[0] || null);
  };

  const handleVariantSelect = (index, variant) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      selectedVariant: variant,
      unit_price: variant.selling_price,
      stock: variant.stock,
    };
    setItems(newItems);
    setSelectedVariant(variant);
  };

  const handleUnitPriceChange = (index, e) => {
    const newItems = [...items];
    newItems[index].unit_price = e.target.value;
    setItems(newItems);
  };

  const handleQuantityChange = (index, e) => {
    const newItems = [...items];
    const quantity = e.target.value;
    newItems[index].quantity = quantity === "" ? null : parseInt(quantity, 10);
    newItems[index].disabledPackage = quantity !== "";
    if (newItems[index].disabledPackage) {
      newItems[index].package = null;
    }
    setItems(newItems);
  };

  const handlePackageChange = (index, e) => {
    const newItems = [...items];
    const packageValue = e.target.value;
    newItems[index].package =
      packageValue === "" ? null : parseInt(packageValue, 10);
    newItems[index].disabledQuantity = packageValue !== "";
    if (newItems[index].disabledQuantity) {
      newItems[index].quantity = null;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        selectedProduct: null,
        unit: "",
        package: null,
        unit_price: "",
        quantity: null,
        stock: 0,
        disabledPackage: false,
        disabledQuantity: false,
      },
    ]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  

  const queryClient = useQueryClient();

  const onSubmit = async () => {
    // Validate that at least one item is selected
    if (!items.length || !items.some((item) => item.selectedProduct)) {
      toast.error("Please select at least one product.");
      return;
    }

    if (isSubmitting) return; // Prevent multiple clicks
    setIsSubmitting(true);

    // Validate all required fields
    for (const item of items) {
      if (!item.selectedProduct) {
        toast.error("Please select a product for all items.");
        return;
      }
      if (!item.quantity && !item.package) {
        toast.error("Please enter quantity or package for all items.");
        return;
      }
    }

    // Prepare the new order items
    const newOrderItems = items.map((item) => {
      // Use the selected variant if available, otherwise use the product
      const product = item.selectedVariant || item.selectedProduct;
      // Calculate the quantity: use package if available, otherwise use quantity
      const quantity = item.package
        ? item.package * (product.piece || 1)
        : item.quantity;
      // Calculate the total price
      const total_price = (item.unit_price || product.selling_price) * quantity;

      return {
        product: product.id,
        product_name: product.name,
        unit: item.unit,
        package: item.package,
        quantity: quantity,
        unit_price: item.unit_price || product.selling_price,
        total_price: total_price,
        status: "Done",
      };
    });

    // Combine with existing order items
    const updatedOrderItems = [...orderItems, ...newOrderItems];

    try {
      const payload = {
        items: updatedOrderItems,
      };
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.ORDERS}/${id}`,
        payload
      );
      if (response.status === 200) {
        toast.success("Order item Added successfully!");
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        await queryClient.refetchQueries({ queryKey: ["orderDetails"] });
        handleClose();
      } else {
        toast.error("Failed to update order items.");
      }
    } catch (error) {
      console.error("Error updating order items:", error);
      toast.error(
        error.response?.data?.error ||
        "An error occurred while updating order items."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
    setItems([
      {
        selectedProduct: null,
        unit: "",
        package: null,
        unit_price: "",
        quantity: null,
        stock: 0,
        disabledPackage: false,
        disabledQuantity: false,
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-8 flex flex-col flex-1 min-h-0">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-300">
              {t("add_orders")}
            </h2>
            <p className="text-sm text-gray-500">
              {items.length} {t("product")}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
            {items.map((item, index) => (
              <div
                key={index}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label
                    htmlFor={`product-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("product_name")}
                  </label>
                  <Select
                    id={`product-${index}`}
                    value={
                      item.selectedProduct
                        ? {
                          label: item.selectedProduct.name,
                          value: item.selectedProduct,
                          hasVariants:
                            item.selectedProduct.variants &&
                            item.selectedProduct.variants.length > 0,
                        }
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleProductChange(index, selectedOption)
                    }
                    options={products?.map((product) => ({
                      label: product.name,
                      value: product,
                      hasVariants:
                        product.variants && product.variants.length > 0,
                    }))}
                    placeholder={t("select_product")}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {item.selectedProduct?.variants?.some(
                  (v) => v.specification
                ) && (
                    <ProductVariantsDisplay
                      product={item.selectedProduct}
                      selectedVariant={item.selectedVariant}
                      onSelectVariant={(variant) =>
                        handleVariantSelect(index, variant)
                      }
                    />
                  )}

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
                        className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor={`package-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Package
                      </label>
                      <input
                        type="number"
                        id={`package-${index}`}
                        value={item.package || ""}
                        onChange={(e) => handlePackageChange(index, e)}
                        className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={item.disabledPackage}
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
                        value={item.unit_price}
                        onChange={(e) => handleUnitPriceChange(index, e)}
                        className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-row justify-between">
                        <label
                          htmlFor={`quantity-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("quantity")}
                        </label>
                        <div className="flex flex-col md:flex md:flex-row space-y-2 md:space-y-0 md:space-x-6">
                          <span
                            className={`text-md ${item.stock > 0
                                ? "text-yellow-600"
                                : "text-red-600"
                              }`}
                          >
                            Stock available: {item.stock}
                          </span>
                        </div>
                      </div>
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        rules={{
                          required: !item.disabledQuantity
                            ? t("quantity_required")
                            : false,
                          min: {
                            value: 1,
                            message: t("quantity_must_greater_zero"),
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            id={`quantity-${index}`}
                            min="1"
                            value={item.quantity === null ? "" : item.quantity}
                            onChange={(e) => {
                              handleQuantityChange(index, e);
                              field.onChange(e);
                            }}
                            className={`p-3 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.items?.[index]?.quantity
                                ? "border-red-500"
                                : "border-gray-300"
                              }`}
                            disabled={item.disabledQuantity}
                          />
                        )}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.items[index].quantity.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-end mt-10">
                  {items.length > 1 && (
                    <Button
                      className="bg-[#FF5555] hover:bg-[#f37979]"
                      type="button"
                      onClick={() => removeItem(index)}
                    >
                      <Trash className="mr-3" />
                      {t("remove")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <Button
              type="button"
              onClick={addItem}
              className="bg-black hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              {t("add_more")}
            </Button>
            <div className="flex flex-row space-x-5">
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-[#55B990] hover:bg-[#54ce9b] text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("submit")}
              </Button>

              <Button
                type="button"
                onClick={handleClose}
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrderModal;
