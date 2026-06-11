import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useSupplierStore from "../../store/useSupplierStore.js";
import { API_ENDPOINTS } from "@/utils/apiConfig.js";
import toast from "react-hot-toast";

const PurchaseAddModal = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([
    {
      product: "",
      unit: "",
      description: "",
      quantity: "",
      unitPrice: "",
    },
  ]);
  const [paymentStatusSecond, setPaymentStatusSecond] = useState("Pending");
  const [paidAmountSecond, setPaidAmountSecond] = useState(0);
  const [errors, setErrors] = useState([
    {
      product: "",
      quantity: "",
      unitPrice: "",
    },
  ]);
  const itemRefs = useRef([]);
  const selectedSupplier = useSupplierStore((state) => state.selectedSupplier);
  const selectedSupplierId = selectedSupplier?.id ? selectedSupplier?.id : null;
  const queryClient = useQueryClient();

  // Fetch supplier data
  const fetchSupplierData = async () => {
    const url = `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${selectedSupplierId}`;
    const res = await axiosInstance.get(url);
    const supplierData = res.data;
    return supplierData;
  };

  // Query for supplier data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["purchaseSupplier",],
    queryFn: () => fetchSupplierData(),
    refetchInterval: 1000,
  });


  const mutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${selectedSupplierId}`,
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
      toast.success("Purchase added successfully");
      resetForm();
      onClose();
    },
    onError: (error) => {
      console.error("Error submitting the form:", error);
      toast.error("Error adding purchase");
    },
  });

  const resetForm = () => {
    setItems([
      {
        product: "",
        unit: "",
        description: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
    setPaymentStatusSecond("Pending");
    setPaidAmountSecond(0);
    setErrors([
      {
        product: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    const newErrors = [...errors];
    if (field === "product") {
      newErrors[index].product =
        value.trim() === "" ? t("product_name_required") : "";
    } else if (field === "quantity") {
      newErrors[index].quantity =
        value === ""
          ? t("quantity_required")
          : value <= 0
            ? t("quantity_must_greater_zero")
            : "";
    } else if (field === "unitPrice") {
      newErrors[index].unitPrice =
        value === ""
          ? t("unit_price_required")
          : value <= 0
            ? t("unit_price_must_greater_zero")
            : "";
    }
    setErrors(newErrors);
  };

  const handleAddMore = () => {
    setItems([
      ...items,
      {
        product: "",
        unit: "",
        description: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
    setErrors([
      ...errors,
      {
        product: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const handleRemove = (index) => {
    setItems(items.filter((_, i) => i !== index));
    setErrors(errors.filter((_, i) => i !== index));
    itemRefs.current = itemRefs.current.filter((_, i) => i !== index);
  };

  useEffect(() => {
    if (itemRefs.current.length > 0) {
      const lastItemRef = itemRefs.current[itemRefs.current.length - 1];
      if (lastItemRef) {
        lastItemRef.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [items]);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return "0.00";
    }
    const num = parseFloat(amount);
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    setErrors(newErrors);
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
    expenses: [...data?.expenses?.results || [], ...groupedNewDataArray],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      mutation.mutate(payload);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 bg-red-400 hover:bg-red-300 text-white py-2 px-4 rounded-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between">
          <h1 className="text-xl font-bold mb-4">{t("add_expense")}</h1>
          <span className="text-md text-gray-500">
            {items.length} {t("expenses")} {t("added")}
          </span>
        </div>
        <div className="border p-4 rounded-lg mt-5 mb-5 max-h-[calc(70vh-4rem)] overflow-auto">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                ref={(el) => (itemRefs.current[index] = el)}
                className="bg-white p-4 rounded-lg border border-gray-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={`products-${index}`}
                      className="block text-sm font-medium text-gray-700"
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
                      className={`mt-1 block w-full py-2 px-3 border ${errors[index]?.product
                        ? "border-red-500"
                        : "border-gray-300"
                        } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                      className="block text-sm font-medium text-gray-700"
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
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`description-${index}`}
                      className="block text-sm font-medium text-gray-700"
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
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`quantity-${index}`}
                      className="block text-sm font-medium text-gray-700"
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
                      className={`mt-1 block w-full py-2 px-3 border ${errors[index]?.quantity
                        ? "border-red-500"
                        : "border-gray-300"
                        } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                      className="block text-sm font-medium text-gray-700"
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
                      className={`mt-1 block w-full py-2 px-3 border ${errors[index]?.unitPrice
                        ? "border-red-500"
                        : "border-gray-300"
                        } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("total_price")}
                    </label>
                    <input
                      type="text"
                      id={`totalPrice-${index}`}
                      value={formatCurrency(item.quantity * item.unitPrice)}
                      disabled
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                      <Trash className="mr-2" /> {t("remove")}
                    </Button>
                  </div>
                )}
                {index < items.length - 1 && (
                  <hr className="my-4 border-t border-gray-300" />
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4 mb-4">
            <div>
              <label
                htmlFor="paymentStatusSecond"
                className="block text-sm font-medium text-gray-700"
              >
                {t("payment_status")}
              </label>
              <select
                id="paymentStatusSecond"
                value={paymentStatusSecond}
                onChange={(e) => setPaymentStatusSecond(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="Pending">{t("pending")}</option>
                <option value="Paid">{t("paid")}</option>
                <option value="Unpaid">{t("unpaid")}</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="paidAmountSecond"
                className="block text-sm font-medium text-gray-700"
              >
                {t("paid_amount")}
              </label>
              <input
                type="number"
                id="paidAmountSecond"
                value={paidAmountSecond}
                onChange={(e) =>
                  setPaidAmountSecond(parseFloat(e.target.value))
                }
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-4 justify-end">
          <Button
            type="button"
            onClick={handleAddMore}
            className="bg-black text-white"
          >
            {t("add_more")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
          >
            {t("submit")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default PurchaseAddModal;
