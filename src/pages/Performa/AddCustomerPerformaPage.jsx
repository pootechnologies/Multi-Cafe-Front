// AddCustomerPerformaPage.js
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, LayoutList } from "lucide-react";
import Select from "react-select";
import { t } from "i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_BASE_URL, API_ENDPOINTS, IMAGE_BASE_URL } from "@/utils/apiConfig";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords";
import usePerformaInnerStorage from "@/store/usePerformaInnerStorage";

const ItemRow = React.memo(
  ({ index, control, errors, t, clearErrors, fields, remove, customerId, updateItem }) => {
    const watchedQuantity = useWatch({
      control,
      name: `items.${index}.quantity`,
    });
    const watchedUnitPrice = useWatch({
      control,
      name: `items.${index}.unitPrice`,
    });
    const total = (watchedQuantity || 0) * (watchedUnitPrice || 0);

    const handleChange = (field, value) => {
      updateItem(customerId, index, field, value);
    };

    return (
      <div className="p-4 space-y-6 bg-white border border-gray-300 rounded-lg">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
              render={({ field, fieldState: { error } }) => (
                <Input
                  {...field}
                  id={`product-${index}`}
                  onChange={(e) => {
                    field.onChange(e);
                    handleChange("product", e.target.value);
                    if (error) clearErrors(`items.${index}.product`);
                  }}
                  className={`mt-1 w-full ${error ? "border-red-500" : ""}`}
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
                  onChange={(e) => {
                    field.onChange(e);
                    handleChange("unit", e.target.value);
                  }}
                  className="w-full mt-1"
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
              render={({ field, fieldState: { error } }) => (
                <Input
                  {...field}
                  type="number"
                  id={`quantity-${index}`}
                  onChange={(e) => {
                    field.onChange(parseInt(e.target.value, 10));
                    handleChange("quantity", parseInt(e.target.value, 10));
                    if (error) clearErrors(`items.${index}.quantity`);
                  }}
                  className={`mt-1 w-full ${error ? "border-red-500" : ""}`}
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
              render={({ field, fieldState: { error } }) => (
                <Input
                  {...field}
                  type="number"
                  id={`unitPrice-${index}`}
                  onChange={(e) => {
                    field.onChange(parseFloat(e.target.value));
                    handleChange("unitPrice", parseFloat(e.target.value));
                    if (error) clearErrors(`items.${index}.unitPrice`);
                  }}
                  className={`mt-1 w-full ${error ? "border-red-500" : ""}`}
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
              value={total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              disabled
              className="w-full mt-1 bg-gray-100"
            />
          </div>
        </div>
        {fields.length > 1 && (
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              onClick={() => remove(index)}
              className="text-white bg-red-600 hover:bg-red-700"
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
  }
);

const AddCustomerPerformaPage = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
    setValue,
    reset: resetFormHook,
  } = useForm({
    defaultValues: {
      items: [{ product: "", unit: "", quantity: 1, unitPrice: "" }],
      selectedReceipt: { value: "Receipt", label: t("receipt") },
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [performaIdFourDigit, setPerformaIdFourDigit] = useState(null);
  const [companyData, setCompanyData] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();
  const { customerId } = useParams();
  const queryClient = useQueryClient();

  // Initialize Zustand store
  const {
    forms,
    addItem,
    removeItem,
    updateItem,
    setSelectedReceipt,
    resetForm,
    initForm,
  } = usePerformaInnerStorage();

  // Initialize form for this customer if it doesn't exist
  useEffect(() => {
    initForm(customerId);
  }, [customerId]);

  // Get the current form for this customer
  const currentForm = forms[customerId] || {
    items: [
      {
        product: "",
        unit: "",
        quantity: 1,
        unitPrice: "",
      },
    ],
    selectedReceipt: { value: "Receipt", label: t("receipt") },
  };

  // Sync Zustand store with react-hook-form only on initial load
  useEffect(() => {
    if (currentForm && !watchedItems.some(item => item.product || item.quantity > 1 || item.unitPrice)) {
      setValue("items", currentForm.items);
      setValue("selectedReceipt", currentForm.selectedReceipt);
    }
  }, [customerId]);

  const watchedItems = watch("items");
  const watchedReceipt = watch("selectedReceipt");

  const { data: selectedPerforma } = useQuery({
    queryKey: ["performaCustomersId", customerId],
    queryFn: () =>
      axiosInstance
        .get(`${API_ENDPOINTS.PERFORMA_CUSTOMER}${customerId}`)
        .then((res) => res.data),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () =>
      axiosInstance
        .get(API_ENDPOINTS.CUSTOMERS)
        .then((res) => res.data),
  });

  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: () =>
      axiosInstance
        .get(API_ENDPOINTS.COMPANY)
        .then((res) => res.data[0]),
    onSuccess: (data) => setCompanyData(data),
  });

  const updatePerformaMutation = useMutation({
    mutationFn: (updatedData) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.PERFORMA_CUSTOMER}${customerId}`,
        updatedData
      ),
    onSuccess: () => {
      toast.success("Performa updated successfully!");
      queryClient.invalidateQueries(["performaCustomersId"]);
      navigate(`/performa-detail`);
    },
    onError: (error) => {
      console.error("Error updating performa:", error);
      toast.error("Failed to update performa!");
      setIsSubmitting(false);
    },
  });

  const calculateSubtotal = () => {
    return watchedItems.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
  };

  const calculateVAT = () => {
    return calculateSubtotal() * 0.15;
  };

  const calculateTotal = () => {
    return watchedReceipt?.value === "No Receipt"
      ? calculateSubtotal()
      : calculateSubtotal() + calculateVAT();
  };

  const handleAddMore = () => {
    append({
      product: "",
      unit: "",
      quantity: 1,
      unitPrice: "",
    });
    addItem(customerId);
  };

  const handleClearAll = () => {
    resetForm(customerId);
    resetFormHook({
      items: [
        {
          product: "",
          unit: "",
          quantity: 1,
          unitPrice: "",
        },
      ],
      selectedReceipt: { value: "Receipt", label: t("receipt") },
    });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const performaData = {
        receipt: data.selectedReceipt.value,
        products: data.items.map((item) => ({
          product: item.product,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unitPrice.toFixed(2),
        })),
      };
      const updatedData = {
        ...selectedPerforma,
        performas: [...(selectedPerforma?.performas?.all_results || []), performaData],
      };
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.PERFORMA_CUSTOMER}${customerId}`,
        updatedData
      );
      if (response.status === 200) {
        toast.success("Performa updated successfully!");
        queryClient.invalidateQueries(["performaCustomersId"]);
        resetForm(customerId);
        navigate(`/performa-detail`);
      }
    } catch (error) {
      console.error("Error updating performa:", error);
      toast.error("Failed to update performa!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const areAllItemsValid = () => {
    return watchedItems.every(
      (item) =>
        item.product?.trim() !== "" &&
        item.quantity > 0 &&
        item.unitPrice > 0
    );
  };

  return (
    <div className="container p-3 ml-0 w-[96%]">
      <h1 className="p-1 px-4 mt-4 mb-4 font-bold border-b">
        {t("add_performa")}
      </h1>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="cursor-pointer">
            <BreadcrumbLink onClick={() => navigate(-1)}>
              <span className="px-4 mt-4 mb-4 font-bold">
                {t("Performa Detail")}
              </span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("Add New Peforma")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="fixed top-0 right-0 z-50 flex items-center h-full">
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-3 font-bold text-white transition-all duration-200 shadow-xl bg-gradient-to-br from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-800 rounded-l-xl">
              <LayoutList className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-[540px] p-6 bg-gradient-to-br from-slate-50 to-white border-l border-slate-200 shadow-2xl">
            <SheetHeader className="flex items-center gap-3 mb-6">
              <SheetTitle className="text-xl font-bold text-gray-800">
                {t("Performa Summary")}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <div className="h-[50vh] overflow-y-auto space-y-4">
                {watchedItems
                  .filter((item) => item.product && item.quantity > 0)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="items-center w-full p-2 transition-all bg-white border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-base font-semibold text-gray-900">
                            {item.product}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} ×{" "}
                            {formatCurrency(item.unitPrice)}
                          </p>
                          <p className="text-lg font-bold text-right text-green-600">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="pt-4 mt-6 mb-10 space-y-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {t("number_of_items")}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {
                      watchedItems.filter(
                        (item) => item.product && item.quantity > 0
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {t("sub_total")}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                {watchedReceipt?.value !== "No Receipt" && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {t("vat")}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(calculateVAT())}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-base font-bold text-blue-600 border-t">
                  <span>{t("total_amount")}</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
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
                isClearable
                {...field}
                id="receipt"
                options={[
                  { value: "Receipt", label: t("receipt") },
                  { value: "No Receipt", label: t("without_receipt") },
                ]}
                className="w-1/2 border border-gray-300 rounded-md shadow-sm"
                placeholder={t("choice_receipt")}
                onChange={(val) => {
                  field.onChange(val);
                  setSelectedReceipt(customerId, val);
                }}
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
              control={control}
              errors={errors}
              t={t}
              clearErrors={clearErrors}
              fields={fields}
              remove={remove}
              customerId={customerId}
              updateItem={updateItem}
            />
          ))}
        </div>
        <div className="flex flex-row justify-end gap-4 mt-4 mb-4">
          <Button
            type="button"
            onClick={handleAddMore}
            className="p-2 mb-2 text-gray-700 bg-transparent border border-gray-400 rounded-md hover:bg-gray-100"
          >
            <Plus className="mr-2" /> {t("add_more")}
          </Button>
          <Button
            type="button"
            onClick={handleClearAll}
            className="text-red-600 bg-transparent border border-gray-400 rounded-md hover:bg-red-50"
          >
            <Trash className="mr-3" />
            {t("clear_all")}
          </Button>
          <Button
            type="submit"
            className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
            disabled={!areAllItemsValid() || isSubmitting}
          >
            {t("submit_performa")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCustomerPerformaPage;
