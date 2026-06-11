import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import toast from "react-hot-toast";
import { Trash, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import ProductVariantsDisplay from "@/components/common/ProductVariantsDisplay";
import { useParams, useNavigate } from "react-router-dom";

const AddCreditPage = () => {
  const { t } = useTranslation();
  const { creditId } = useParams();
  const navigate = useNavigate();
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

  const { data: creditDetails = [], isLoading: isLoadingCreditDetails } =
    useQuery({
      queryKey: ["creditDetails", creditId],
      queryFn: () =>
        axiosInstance
          .get(`${API_ENDPOINTS.ORDERS}/${creditId}`)
          .then((res) => res.data),
      enabled: !!creditId,
    });
  const creditItems = creditDetails?.data?.items;

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
    fetchProducts();
  }, []);

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
    if (!items.length || !items.some((item) => item.selectedProduct)) {
      toast.error("Please select at least one product.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    for (const item of items) {
      if (!item.selectedProduct) {
        toast.error("Please select a product for all items.");
        setIsSubmitting(false);
        return;
      }
      if (!item.quantity && !item.package) {
        toast.error("Please enter quantity or package for all items.");
        setIsSubmitting(false);
        return;
      }
    }

    const newCreditItems = items.map((item) => {
      const product = item.selectedVariant || item.selectedProduct;
      const quantity = item.package
        ? item.package * (product.piece || 1)
        : item.quantity;
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

    const updatedCreditItems = [...creditItems, ...newCreditItems];

    try {
      const payload = {
        items: updatedCreditItems,
      };
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.ORDERS}/${creditId}`,
        payload
      );
      if (response.status === 200) {
        toast.success("Credit item Added successfully!");
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        await queryClient.refetchQueries({ queryKey: ["creditDetails"] });
        navigate(`/credit-detail/${creditId}`);
      } else {
        toast.error("Failed to update credit items.");
      }
    } catch (error) {
      console.error("Error updating credit items:", error);
      toast.error(
        error.response?.data?.error ||
        "An error occurred while updating credit items."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate(`/credit-detail/${creditId}`);
  };

  return (
    <div className="p-6 max-w-4xl ">
      <div className="flex items-center gap-4 mb-6">

        <h1 className="text-lg  w-full font-bold">{t("add_credit")}</h1>

      </div>

      <div className="bg-white rounded-lg shadow-sm ">
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="space-y-4">
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
                  className="w-full"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("unit")}
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].unit = e.target.value;
                        setItems(newItems);
                      }}
                      className="p-3 w-full border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Package
                    </label>
                    <input
                      type="number"
                      value={item.package || ""}
                      onChange={(e) => handlePackageChange(index, e)}
                      className="p-3 w-full border border-gray-300 rounded-md"
                      disabled={item.disabledPackage}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("unit_price")}
                    </label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleUnitPriceChange(index, e)}
                      className="p-3 w-full border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("quantity")}
                      </label>
                      <span
                        className={`text-sm ${item.stock > 0 ? "text-yellow-600" : "text-red-600"
                          }`}
                      >
                        Stock: {item.stock}
                      </span>
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
                          min="1"
                          value={item.quantity === null ? "" : item.quantity}
                          onChange={(e) => {
                            handleQuantityChange(index, e);
                            field.onChange(e);
                          }}
                          className={`p-3 w-full border rounded-md ${errors.items?.[index]?.quantity
                              ? "border-red-500"
                              : "border-gray-300"
                            }`}
                          disabled={item.disabledQuantity}
                        />
                      )}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-red-600">
                        {errors.items[index].quantity.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {items.length > 1 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Trash className="h-4 w-4" />
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
            variant="outline"
            className="flex items-center gap-2"
          >
            {t("add_more")}
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-[#55B990] hover:bg-[#54ce9b] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : t("submit")}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              variant="destructive"
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCreditPage;