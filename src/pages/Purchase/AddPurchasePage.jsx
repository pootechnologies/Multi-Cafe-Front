import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash, LayoutList } from "lucide-react";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig.js";
import toast from "react-hot-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import usePurchaseInnerFormStore from "@/store/usePurchaseInnerFormStore";

const AddPurchasePage = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Initialize Zustand store
  const {
    forms,
    addItem,
    removeItem,
    updateItem,
    setPaymentStatusSecond,
    setPaidAmountSecond,
    resetForm,
    initForm,
  } = usePurchaseInnerFormStore();

  // Initialize form for this supplier if it doesn't exist
  useEffect(() => {
    initForm(supplierId);
  }, [supplierId]);

  // Get the current form for this supplier
  const currentForm = forms[supplierId] || {
    items: [
      {
        product: "",
        unit: "",
        description: "",
        quantity: "",
        unitPrice: "",
      },
    ],
    paymentStatusSecond: "Pending",
    paidAmountSecond: 0,
    errors: [
      {
        product: "",
        quantity: "",
        unitPrice: "",
      },
    ],
  };

  const { items, paymentStatusSecond, paidAmountSecond, errors } = currentForm;

  // Fetch supplier data
  const fetchSupplierData = async () => {
    const url = `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${supplierId}`;
    const res = await axiosInstance.get(url);
    const supplierData = res.data;
    return supplierData;
  };

  // Query for supplier data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["purchaseSupplier", supplierId],
    queryFn: () => fetchSupplierData(),
    refetchInterval: 1000,
  });

  const mutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${supplierId}`,
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
      toast.success("Purchase added successfully");
      resetForm(supplierId);
      navigate(-1);
    },
    onError: (error) => {
      console.error("Error submitting the form:", error);
      toast.error("Error adding purchase");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleChange = (index, field, value) => {
    updateItem(supplierId, index, field, value);
  };

  const handleAddMore = () => {
    addItem(supplierId);
  };

  const handleRemove = (index) => {
    removeItem(supplierId, index);
  };

  // Clear all form data for the current supplier
  const handleClearAll = () => {
    resetForm(supplierId);
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return "0.00";
    }
    const num = parseFloat(amount);
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return acc + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = [...errors];
    items.forEach((item, index) => {
      if (item.product.trim() === "") {
        newErrors[index].product = t("product_name_required");
        isValid = false;
      }
      if (item.quantity === "" || item.quantity <= 0) {
        newErrors[index].quantity =
          item.quantity === ""
            ? t("quantity_required")
            : t("quantity_must_greater_zero");
        isValid = false;
      }
      if (item.unitPrice === "" || item.unitPrice <= 0) {
        newErrors[index].unitPrice =
          item.unitPrice === ""
            ? t("unit_price_required")
            : t("unit_price_must_greater_zero");
        isValid = false;
      }
    });
    // Update errors in the store
    usePurchaseInnerFormStore.getState().forms[supplierId].errors = newErrors;
    return isValid;
  };

  const newData = items.map((item) => ({
    payment_status: paymentStatusSecond,
    paid_amount: paidAmountSecond,
    products: {
      product: item.product,
      unit: item.unit,
      description: item.description,
      quantity: item.quantity,
      unit_price: parseFloat(item.unitPrice).toFixed(2),
    },
  }));

  const groupedNewData = newData.reduce((acc, item) => {
    const key = `${item.payment_status}-${item.paid_amount}`;
    if (!acc[key]) {
      acc[key] = {
        payment_status: item.payment_status,
        paid_amount: item.paid_amount,
        products: [],
      };
    }
    acc[key].products.push(item.products);
    return acc;
  }, {});

  const groupedNewDataArray = Object.values(groupedNewData);

  const payload = {
    id: data?.data?.id,
    supplier: data?.data?.supplier,
    supplier_name: data?.data?.supplier_name,
    total_amount: data?.data?.total_amount,
    payment_status: data?.data?.payment_status,
    paid_amount: data?.data?.paid_amount,
    unpaid_amount: data?.data?.unpaid_amount,
    user: data?.data?.user,
    expenses: [...data?.expenses?.all_results || [], ...groupedNewDataArray],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      mutation.mutate(payload);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="main-content">
      <div className="max-w-4xl p-6 bg-white relative">
        <div className="fixed top-0 right-0 h-full flex items-center z-50">
          <Sheet>
            <SheetTrigger asChild>
              <button className="bg-gradient-to-br from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-5 rounded-l-xl shadow-xl transition-all duration-200 flex items-center gap-2">
                <LayoutList className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[540px] p-6 bg-gradient-to-br from-slate-50 to-white border-l border-slate-200 shadow-2xl">
              <SheetHeader className="mb-6 flex items-center gap-3">
                <SheetTitle className="text-xl font-bold text-gray-800">
                  {t("purchase_summary")}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                <div className="h-[50vh] overflow-y-auto space-y-4 pr-2">
                  {items
                    .filter((item) => item.product && item.quantity > 0)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="w-full p-2 bg-white border border-gray-200 transition-all items-center mb-4"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-base font-semibold text-gray-900">
                            {item.product}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="text-right text-lg font-bold text-green-600">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </p>
                      </div>
                    ))}
                </div>
                <div className="mt-6 space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {t("number_of_items")}
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {items.filter((item) => item.product && item.quantity > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {t("sub_total")}
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {formatCurrency(calculateSubtotal())}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-blue-600 border-t pt-2">
                    <span>{t("total_amount")}</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold text-gray-900">
            {t("add_expense")}
          </h1>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <div className="space-y-6">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-2 border-gray-200"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={`products-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t("product_name")}
                    </label>
                    <input
                      type="text"
                      id={`products-${index}`}
                      value={item.product}
                      onChange={(e) =>
                        handleChange(index, "product", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[index]?.product
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                    />
                    {errors[index]?.product && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[index].product}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={`unit-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t("unit")}
                    </label>
                    <input
                      type="text"
                      id={`unit-${index}`}
                      value={item.unit}
                      onChange={(e) =>
                        handleChange(index, "unit", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`description-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t("description")}
                    </label>
                    <input
                      type="text"
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) =>
                        handleChange(index, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`quantity-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t("quantity")}
                    </label>
                    <input
                      type="number"
                      id={`quantity-${index}`}
                      value={item.quantity}
                      onChange={(e) =>
                        handleChange(index, "quantity", e.target.value)
                      }
                      min={1}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[index]?.quantity
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                    />
                    {errors[index]?.quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[index].quantity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={`unitPrice-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t("unit_price")}
                    </label>
                    <input
                      type="number"
                      id={`unitPrice-${index}`}
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleChange(index, "unitPrice", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[index]?.unitPrice
                          ? "border-red-500"
                          : "border-gray-300"
                        }`}
                    />
                    {errors[index]?.unitPrice && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[index].unitPrice}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={`totalPrice-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t("total_price")}
                    </label>
                    <input
                      type="text"
                      id={`totalPrice-${index}`}
                      value={formatCurrency(item.quantity * item.unitPrice)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
                    />
                  </div>
                </div>
                {items.length > 1 && (
                  <div className="flex justify-end mt-4">
                    <Button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash className="mr-2 w-4 h-4" /> {t("remove")}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div>
              <label
                htmlFor="paymentStatusSecond"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("payment_status")}
              </label>
              <select
                id="paymentStatusSecond"
                value={paymentStatusSecond}
                onChange={(e) => setPaymentStatusSecond(supplierId, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">{t("pending")}</option>
                <option value="Paid">{t("paid")}</option>
                <option value="Unpaid">{t("unpaid")}</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="paidAmountSecond"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("paid_amount")}
              </label>
              <input
                type="number"
                id="paidAmountSecond"
                value={paidAmountSecond}
                onChange={(e) =>
                  setPaidAmountSecond(supplierId, parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">

         <div className="flex-1">
           <Button
            type="button"
            onClick={handleAddMore}
            className="px-6 py-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
          >
            {t("add_more")}
              </Button>
         </div>
        
          <Button
            type="button"
            onClick={handleClearAll}
            className="rounded-md border border-gray-400 bg-transparent text-red-600 hover:bg-red-50"
          >
            <Trash className="mr-3" />
            {t("clear_all")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md text-white ${isSubmitting
                ? "bg-[#55B990] cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPurchasePage;
