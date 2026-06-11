import { PackageCheck, Plus, Trash, UserPlus, ShoppingBag, ReceiptText } from "lucide-react";
import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import Select from "react-select";
import toast from "react-hot-toast";
import { t } from "i18next";
import { Button } from "@/components/ui/button";

const AddCustomer = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([
    { productInput: "", selectedProduct: null, quantity: 0 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });
  
  const formatter = new Intl.NumberFormat("am-ET", {
    style: "currency",
    currency: "ETB",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS);
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchProducts();
    fetchCustomers();
  }, []);

  const handleCustomerChange = (selectedOption) => {
    const customer = selectedOption ? selectedOption.value : null;
    setSelectedCustomer(customer);
    setPhoneNumber(customer ? customer.phone : "");
    setAddress(customer ? customer.address : "");
  };

  const handleProductChange = (index, selectedOption) => {
    const newItems = [...items];
    newItems[index].productInput = selectedOption ? selectedOption.label : "";
    newItems[index].selectedProduct = selectedOption ? selectedOption.value : null;
    setItems(newItems);
  };

  const handleQuantityChange = (index, event) => {
    const newItems = [...items];
    const quantity = event.target.value;
    newItems[index].quantity = quantity === "" ? 0 : parseInt(quantity, 10);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productInput: "", selectedProduct: null, quantity: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotalAmount = () => {
    return items.reduce((total, item) => {
      if (item.selectedProduct && item.quantity > 0) {
        return total + item.selectedProduct.selling_price * item.quantity;
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }
    const validItems = items.filter((item) => item.selectedProduct && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    const order = {
      customer: selectedCustomer.id,
      status: "Pending",
      total_amount: calculateTotalAmount(),
      phone_number: phoneNumber,
      address: address,
      items: validItems.map((item) => ({
        product: item.selectedProduct.id,
        quantity: item.quantity,
        price: item.selectedProduct.selling_price,
      })),
    };

    try {
      await axiosInstance.post(API_ENDPOINTS.ORDERS, order);
      toast.success("Order placed successfully!");
      setItems([{ productInput: "", selectedProduct: null, quantity: 0 }]);
      setSelectedCustomer(null);
      setPhoneNumber("");
      setAddress("");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Failed to place order.");
    }
  };

  const handleNewCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(API_ENDPOINTS.CUSTOMERS, newCustomer);
      toast.success("Customer added successfully!");
      setIsModalOpen(false);
      setNewCustomer({ name: "", phone: "", address: "" });
      // Refresh customer list
      const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS);
      setCustomers(response.data);
    } catch (error) {
      toast.error("Failed to add customer.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Place Order</h2>
                  <p className="text-sm text-slate-500">Create a new customer order</p>
                </div>
              </div>
              <Button 
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Add New Customer
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Customer Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Customer Name</label>
                  <Select
                    options={customers.map((c) => ({ label: c.name, value: c }))}
                    placeholder="Select customer..."
                    value={selectedCustomer ? { label: selectedCustomer.name, value: selectedCustomer } : null}
                    onChange={handleCustomerChange}
                    className="text-sm"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '1rem',
                        padding: '4px',
                        borderColor: '#e2e8f0',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#3b82f6' }
                      })
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    readOnly
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-sm outline-none cursor-not-allowed"
                    placeholder="Auto-filled"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Delivery Address</label>
                  <input
                    type="text"
                    value={address}
                    readOnly
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-sm outline-none cursor-not-allowed"
                    placeholder="Auto-filled"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    Order Items
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 relative group animate-in slide-in-from-left-2 duration-300">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash className="h-4 w-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        <div className="md:col-span-7 space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product</label>
                          <Select
                            value={item.selectedProduct ? { label: item.selectedProduct.category_name, value: item.selectedProduct } : null}
                            onChange={(opt) => handleProductChange(index, opt)}
                            options={products.map((p) => ({ label: p.category_name, value: p }))}
                            placeholder="Select product..."
                            className="text-sm"
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderRadius: '0.75rem',
                                padding: '2px',
                                borderColor: '#e2e8f0',
                                '&:hover': { borderColor: '#3b82f6' }
                              })
                            }}
                          />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity === 0 ? "" : item.quantity}
                            onChange={(e) => handleQuantityChange(index, e)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                            placeholder="Qty"
                          />
                        </div>
                        <div className="md:col-span-2 text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Subtotal</p>
                          <p className="font-bold text-slate-800 dark:text-slate-100">
                            {item.selectedProduct ? formatter.format(item.selectedProduct.selling_price * (item.quantity || 0)) : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={addItem}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add More Products
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Summary Section */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <ReceiptText className="h-6 w-6 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Order Summary</h3>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {items.filter(i => i.selectedProduct && i.quantity > 0).length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-10 w-10 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No items added yet</p>
                </div>
              ) : (
                items.filter(i => i.selectedProduct && i.quantity > 0).map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-4 text-sm animate-in fade-in duration-300">
                    <div className="flex-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300">{item.selectedProduct.category_name}</p>
                      <p className="text-slate-500 text-xs">{item.quantity} pcs @ {formatter.format(item.selectedProduct.selling_price)}</p>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {formatter.format(item.selectedProduct.selling_price * item.quantity)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="text-2xl font-black text-blue-600">
                  {formatter.format(calculateTotalAmount())}
                </span>
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-600/20"
              >
                <PackageCheck className="mr-2 h-6 w-6" /> Submit Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adding a new customer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-8 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Add New Customer</h2>
            <form onSubmit={handleNewCustomerSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Customer Name</label>
                <input
                  type="text"
                  name="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 h-14 rounded-2xl">Cancel</Button>
                <Button type="submit" className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold">Add Customer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCustomer;
