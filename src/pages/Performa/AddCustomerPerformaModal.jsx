import React, { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import Select from "react-select";
import { t } from "i18next";
import usePerformaStore from "@/store/usePerformaStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import toast from "react-hot-toast";

const AddCustomerPerformaModal = ({
  selectedCustomerPerforma,
  setIsAddPerformaModalOpen,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      items: [{ product: "", unit: "", quantity: 1, unitPrice: "" }],
      selectedReceipt: { label: "Receipt", value: "Receipt" },
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const itemRefs = useRef([]);
  const lastItemRef = useRef(null);
  const selectedPerformaId = selectedCustomerPerforma.id;

  const handleReceiptChange = (selectedOption) => {
    setValue("selectedReceipt", selectedOption.value);
  };

  const {
    data: selectedPerforma,
    isLoading: isLoadingPerformas,
    refetch,
  } = useQuery({
    queryKey: ["performaCustomersId"],
    queryFn: () =>
      axiosInstance
        .get(`${API_ENDPOINTS.PERFORMA_CUSTOMER}${selectedPerformaId}`)
        .then((res) => res.data),
    refetchOnWindowFocus: true,
    refetchInterval: 1500,
  });

  const queryClient = useQueryClient();

  const onSubmit = (data) => {
    setIsSubmitting(true);
    const performaData = {
      receipt: data.selectedReceipt.value,
      products: data.items.map((item) => ({
        product: item.product,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    };
    const updatedData = {
      ...selectedPerforma,
      performas: [...(selectedPerforma.performas || []), performaData],
    };
    updatePerformaMutation.mutate(updatedData);
  };

  const updatePerformaMutation = useMutation({
    mutationFn: (updatedData) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.PERFORMA_CUSTOMER}${selectedPerformaId}/`,
        updatedData
      ),
    onSuccess: () => {
      toast.success("Performa updated successfully!");
      queryClient.invalidateQueries(["performaCustomersId"]);
      setIsSubmitting(false);
      setIsAddPerformaModalOpen(false);
    },
    onError: (error) => {
      console.error("Error updating performa:", error);
      toast.error("Failed to update performa!");
      setIsSubmitting(false);
    },
  });

  const handleAddMore = () => {
    append({ product: "", unit: "", quantity: 1, unitPrice: "" });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const formatCurrency = (amount) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    if (lastItemRef.current) {
      lastItemRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [fields]);

  const ItemRow = ({ index, item, control, errors, t }) => {
    const watchedQuantity = useWatch({
      control,
      name: `items.${index}.quantity`,
    });
    const watchedUnitPrice = useWatch({
      control,
      name: `items.${index}.unitPrice`,
    });
    const total = (watchedQuantity || 0) * (watchedUnitPrice || 0);

    return (
      <div
        ref={
          index === fields.length - 1 ? lastItemRef : itemRefs.current[index]
        }
        className="bg-white p-4 rounded-lg border border-gray-300 space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`product-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              {t("product_name")}
            </label>
            <Controller
              name={`items.${index}.product`}
              control={control}
              rules={{ required: t("product_name_required") }}
              render={({ field }) => (
                <Input
                  {...field}
                  id={`product-${index}`}
                  className={`mt-1 w-full ${
                    errors.items?.[index]?.product ? "border-red-500" : ""
                  }`}
                />
              )}
            />
            {errors.items?.[index]?.product && (
              <p className="mt-1 text-sm text-red-600">
                {errors.items[index].product.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={`unit-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              {t("unit")}
            </label>
            <Controller
              name={`items.${index}.unit`}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={`unit-${index}`}
                  className="mt-1 w-full"
                />
              )}
            />
          </div>
          <div>
            <label
              htmlFor={`quantity-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              {t("quantity")}
            </label>
            <Controller
              name={`items.${index}.quantity`}
              control={control}
              rules={{
                required: t("quantity_required"),
                min: { value: 1, message: t("quantity_must_greater_zero") },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  id={`quantity-${index}`}
                  className={`mt-1 w-full ${
                    errors.items?.[index]?.quantity ? "border-red-500" : ""
                  }`}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              )}
            />
            {errors.items?.[index]?.quantity && (
              <p className="mt-1 text-sm text-red-600">
                {errors.items[index].quantity.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={`unitPrice-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              {t("unit_price")}
            </label>
            <Controller
              name={`items.${index}.unitPrice`}
              control={control}
              rules={{
                required: t("unit_price_required"),
                min: {
                  value: 0.01,
                  message: t("unit_price_must_greater_zero"),
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  id={`unitPrice-${index}`}
                  className={`mt-1 w-full ${
                    errors.items?.[index]?.unitPrice ? "border-red-500" : ""
                  }`}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              )}
            />
            {errors.items?.[index]?.unitPrice && (
              <p className="mt-1 text-sm text-red-600">
                {errors.items[index].unitPrice.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={`totalPrice-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              {t("total_price")}
            </label>
            <Input
              type="text"
              id={`totalPrice-${index}`}
              value={formatCurrency(total)}
              disabled
              className="mt-1 w-full bg-gray-100"
            />
          </div>
        </div>
        {fields.length > 1 && (
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              onClick={() => remove(index)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Trash className="mr-2" /> {t("remove")}
            </Button>
          </div>
        )}
        {index < fields.length - 1 && (
          <hr className="my-4 border-t border-gray-300" />
        )}
      </div>
    );
  };

  const ItemModal = ({ isOpen, onClose, onAdd, t }) => {
    const [item, setItem] = useState({
      product: "",
      unit: "",
      quantity: 1,
      unitPrice: 0,
    });

    const handleChange = (field, value) => {
      setItem({
        ...item,
        [field]: value,
      });
    };

    const handleSubmit = () => {
      onAdd(item);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-4xl">
          <h2 className="text-lg font-semibold mb-4">{t("add_item")}</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="product"
                className="block text-sm font-medium text-gray-700"
              >
                {t("product_name")}
              </label>
              <input
                type="text"
                id="product"
                value={item.product}
                onChange={(e) => handleChange("product", e.target.value)}
                className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-gray-700"
              >
                {t("unit")}
              </label>
              <input
                type="text"
                id="unit"
                value={item.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700"
              >
                {t("quantity")}
              </label>
              <input
                type="number"
                id="quantity"
                value={item.quantity}
                onChange={(e) =>
                  handleChange("quantity", parseInt(e.target.value, 10))
                }
                className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="unitPrice"
                className="block text-sm font-medium text-gray-700"
              >
                {t("unit_price")}
              </label>
              <input
                type="number"
                id="unitPrice"
                value={item.unitPrice}
                onChange={(e) =>
                  handleChange("unitPrice", parseFloat(e.target.value))
                }
                className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg"
            >
              <Plus className="mr-2" /> {t("add")}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-black text-white py-2 px-4 rounded-lg"
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="receipt"
          className="block text-sm font-medium text-gray-700"
        >
          {t("receipt")}
        </label>
        <Controller
          name="selectedReceipt"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              id="receipt"
              options={[
                { value: "Receipt", label: t("receipt") },
                { value: "No Receipt", label: t("without_receipt") },
              ]}
              className="w-1/2 border border-gray-300 rounded-md shadow-sm"
              placeholder={t("choice_receipt")}
              onChange={(val) => field.onChange(val)}
              value={[
                { value: "Receipt", label: t("receipt") },
                { value: "No Receipt", label: t("without_receipt") },
              ].find((option) => option.value === field.value?.value)}
            />
          )}
        />
      </div>
      <div className="flex flex-col space-y-4">
        {fields.map((item, index) => (
          <ItemRow
            key={item.id}
            index={index}
            item={item}
            control={control}
            errors={errors}
            t={t}
          />
        ))}
      </div>
      <div className="flex gap-4 mt-4 mb-4 flex-row justify-between">
        <Button
          type="button"
          onClick={handleAddMore}
          className="bg-black text-white"
        >
          <Plus className="mr-2" /> {t("add_more")}
        </Button>
        <Button
          type="submit"
          className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
          disabled={isSubmitting}
        >
          {t("submit_performa")}
        </Button>
      </div>
      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={(item) => {
          append(item);
          handleCloseModal();
        }}
        t={t}
      />
    </form>
  );
};

export default AddCustomerPerformaModal;
