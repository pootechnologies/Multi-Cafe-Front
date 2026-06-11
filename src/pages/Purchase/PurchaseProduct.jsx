import { useEffect, useState } from "react";
import { Plus, Trash, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import Select from "react-select";
import AddSupplierModal from "@/pages/Products/AddSupplierModal.jsx";
import { t } from "i18next";
import toast from "react-hot-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import usePurchaseStore from "@/store/usePurchaseStore";

const PurchaseExpense = () => {
  const {
    items,
    supplier,
    paymentStatusSecond,
    paidAmountSecond,
    addItem,
    removeItem,
    updateItem,
    setSupplier,
    setPaymentStatusSecond,
    setPaidAmountSecond,
    resetForm,
  } = usePurchaseStore();

  const [errors, setErrors] = useState(
    items.map(() => ({
      product: "",
      quantity: "",
      unitPrice: "",
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.SUPPLIERS);
        setSuppliers(
          response.data.map((supplier) => ({
            id: supplier.id,
            label: supplier.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  const validateForm = () => {
    const newErrors = items.map((item) => ({
      product: item.product.trim() === "" ? t("product_name_required") : "",
      quantity:
        item.quantity === ""
          ? t("quantity_required")
          : item.quantity <= 0
            ? t("quantity_must_greater_zero")
            : "",
      unitPrice:
        item.unitPrice === ""
          ? t("unit_price_required")
          : item.unitPrice <= 0
            ? t("unit_price_must_greater_zero")
            : "",
    }));
    setErrors(newErrors);
    return !newErrors.some(
      (error) =>
        error.product !== "" || error.quantity !== "" || error.unitPrice !== ""
    );
  };

  const handleChange = (index, field, value) => {
    updateItem(index, field, value);
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
    addItem();
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
    removeItem(index);
    setErrors(errors.filter((_, i) => i !== index));
  };

  const handleSupplierChange = (selectedOption) => {
    setSupplier(selectedOption);
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

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return "0.00";
    }
    const num = parseFloat(amount);
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    const supplierId = supplier?.id || null;
    const formattedData = {
      supplier: supplierId,
      expenses: [
        {
          payment_status: paymentStatusSecond,
          paid_amount: paidAmountSecond,
          products: items.map((item) => ({
            product: item.product,
            unit: item.unit,
            description: item.description,
            quantity: item.quantity,
            unit_price: parseFloat(item.unitPrice).toFixed(2),
          })),
        },
      ],
    };
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PURCHASE_SUPPLIERS,
        formattedData
      );
      if (response.data && response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success("Purchase submitted successfully!");
        resetForm();
      }
    } catch (error) {
      if (error?.response && error?.response?.data) {
        toast.error(error?.response?.data?.supplier[0]);
      } else {
        toast.error("An error occurred while submitting the purchase.");
      }
      console.error("Error making POST request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSupplierModal = () => {
    setIsSupplierModalOpen(true);
  };

  const closeSupplierModal = () => {
    setIsSupplierModalOpen(false);
  };

  const handleSupplierAdded = () => {
    const fetchSuppliers = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.SUPPLIERS);
        setSuppliers(
          response.data.map((supplier) => ({
            id: supplier.id,
            label: supplier.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  };

  const handleClearAll = () => {
    resetForm();
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#ebedf2" : "white",
      color: state.isSelected ? "black" : "black",
      "&:hover": {
        backgroundColor: state.isSelected ? "#ebedf2" : "#f0f0f0",
      },
    }),
  };

  return (
    <div className="App grid grid-cols-1 lg:grid-cols-8 gap-5">
      <form onSubmit={handleSubmit} className="p-4 col-span-5">
        <h3 className="lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-5 sm:text-sm border-b">
          {t("purchase_product")}
        </h3>
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
                        className="w-full p-2 bg-white border border-gray-200 transition-all items-center mb-10"
                      >
                        <div className="flex justify-between items-start ">
                          <p className="text-base font-semibold text-gray-900">
                            {item.product}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} ×{" "}
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="text-right text-lg font-bold text-green-600">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </p>
                      </div>
                    ))}
                </div>
                <div className="mt-6 space-y-2 border-t pt-4 mb-10">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {t("number_of_items")}
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {
                        items.filter(
                          (item) => item.product && item.quantity > 0
                        ).length
                      }
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
        <div className="relative mt-8">
          <label
            htmlFor="supplier"
            className="block text-sm font-medium text-gray-700"
          >
            {t("supplier")}
          </label>
          <Select
          isClearable
            id="supplier"
            options={suppliers}
            value={supplier}
            onChange={handleSupplierChange}
            className="mt-1 block w-full md:w-1/2 sm:w-full  border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder={t("select_supplier")}
          />
          <div className="absolute -top-7 right-0">
            <Button className="rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100" type="button" onClick={openSupplierModal}>
              <Plus /> {t("add_suppliers")}
            </Button>
          </div>
        </div>
        <div className="border p-4 rounded-lg mt-5 mb-5">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
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
        <div className="flex gap-4 mt-4 flex-row justify-end">
          <Button
            className="rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
            type="button"
            onClick={handleAddMore}
          >
            <Plus className="mr-2" /> {t("add_more")}
          </Button>
          <Button
            type="button"
            onClick={handleClearAll}
            className="rounded-md border border-gray-400 bg-transparent text-red-600 hover:bg-red-50"
          >
            <Trash className="mr-2" /> {t("clear_all")}
          </Button>
          <Button
            type="submit"
            disabled={
              errors.some(
                (error) =>
                  error.product !== "" ||
                  error.quantity !== "" ||
                  error.unitPrice !== ""
              ) || isSubmitting
            }
            className="text-white bg-[#55B990] hover:bg-[#54ce9b]"
          >
            {t("submit_purchase")}
          </Button>
        </div>
      </form>
      <AddSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={closeSupplierModal}
        onSupplierAdded={handleSupplierAdded}
      />
    </div>
  );
};

export default PurchaseExpense;
