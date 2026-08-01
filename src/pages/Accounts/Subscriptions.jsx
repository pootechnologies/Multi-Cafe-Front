import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_BASE_TENANT_URL, API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Select from "react-select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Crown,
  Zap,
  Sparkles,
  Check,
  Search,
  Hash,
  DollarSign,
  Info,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

const planFeatures = [
  {
    name: "Basic",
    subtitle: "For Small-sized businesses",
    features: [
      "Sales Management System",
      "Real-time Inventory Tracking & Dashboard",
      "Product Catalog (Manual + Excel Export)",
      "Stock Movement & Transfers",
      "Low-stock Alerts",
      "Customer Management (profiles & order history)",
      "Credit Management",
      "Role-Based Access Control",
      "Reports & Analytics (sales, inventory changes, trends)",
      "Mobile-friendly, Cloud Hosting & Regular Backups",
      "Hosting + Regular Support + Continuous System updates",
    ],
  },
  {
    name: "Pro",
    subtitle: "For Medium-sized businesses and multi-branch organizations",
    features: [
      "All features from the Basic Plan",
      "Multi-branch Management",
      "Multi-warehouse Management",
    ],
  },
  {
    name: "Premium",
    subtitle: "Large enterprises, multi-branch organizations and distributors",
    features: [
      "All features from the Pro Plan",
      "Batch / Serial Number & Expiry Date Tracking",
      "Supplier & Purchase Order Management",
      "Performa Management",
      "Automated Reorder Rules & Advanced Alerting",
      "Custom Analytics Dashboards & KPI Reports",
      "Integration with POS",
      "Dedicated Account Manager",
    ],
  },
  {
    name: "Tokiyo",
    subtitle: "Large enterprises, multi-branch organizations and distributors",
    features: [
      "All features from the Pro Plan",
      "Batch / Serial Number & Expiry Date Tracking",
      "Supplier & Purchase Order Management",
      "Performa Management",
      "Automated Reorder Rules & Advanced Alerting",
      "Custom Analytics Dashboards & KPI Reports",
      "Integration with POS",
      "Dedicated Account Manager",
    ],
  },
];


const getCurrentUserEmail = () => {
  try {
    const userInfo = localStorage.getItem("user_info");
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.email || null;
    }
  } catch (e) {
    console.error("Error parsing user_info from localStorage", e);
  }
  return null;
};

const currentUserEmail = getCurrentUserEmail();

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [selectedSubPlan, setSelectedSubPlan] = useState(null);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [isSubProcessing, setIsSubProcessing] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const planOptions = plans.map((plan) => ({
    value: plan.id,
    label: plan.subscriptionPlan?.name || plan.tenant,
  }));

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.TENANT_PAYMENT_CHECK,
      );
      // Handle response structure { "payments": [...] }
      const paymentsData = response.data?.payments || response.data || [];
      const sortedPlans = paymentsData.sort((a, b) => b.id - a.id);
      setPlans(sortedPlans);
      setFilteredPlans(sortedPlans);

      // If payments data is empty, fetch subscription plans to show cards
      if (paymentsData.length === 0) {
        fetchSubscriptionPlans();
      }
    } catch (error) {
      console.error("There was an error fetching the data:", error);
      // On error, try to fetch subscription plans
      fetchSubscriptionPlans();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    setIsSubLoading(true);
    try {
      const response = await axiosInstance.get(
        `${API_BASE_TENANT_URL}${API_ENDPOINTS.TENANT_SUBSCRIPTIONS}`,
      );

      let plans = response.data?.results || [];

      // Filter plans based on email
      if (currentUserEmail === "tokiyogeneraltrading@gmail.com") {
        // Show only Tokiyo plan
        plans = plans.filter(plan => plan.name.toLowerCase().includes("tokiyo"));
      } else {
        // Hide Tokiyo plan for other users
        plans = plans.filter(plan => !plan.name.toLowerCase().includes("tokiyo"));
      }

      setSubscriptionPlans(plans);
    } catch (error) {
      console.error("There was an error fetching subscription plans:", error);
    } finally {
      setIsSubLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchSubscriptionPlans();
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Filtering logic for select only
  useEffect(() => {
    let result = [...plans];

    if (selectedOption) {
      result = result.filter((plan) => plan.id === selectedOption.value);
    }

    setFilteredPlans(result);
    setCurrentPage(1);
  }, [selectedOption, plans]);

  useEffect(() => {
    if (selectedPlan) {
      setValue("name", selectedPlan.subscriptionPlan?.name);
      setValue("price", selectedPlan.subscriptionPlan?.price);
      setValue("duration_days", selectedPlan.subscriptionPlan?.duration_days);
      setValue("is_active", selectedPlan.subscriptionPlan?.is_active);
    }
  }, [selectedPlan, setValue]);

  const getPlanFeatures = (planName) => {
    const match = planFeatures.find(
      (pf) => pf.name.toLowerCase() === (planName || "").toLowerCase(),
    );
    return match ? match.features : ["Full access to all features"];
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "paid_verified":
        return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      case "pending":
        return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "failed":
        return "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      case "cancelled":
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
      default:
        return "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    }
  };
  const formatStatusForDisplay = (status) => {
    switch (status) {
      case "paid_verified":
        return "Paid";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      case "cancelled":
        return "Cancelled";
      default:
        return status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : status;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewClick = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const deletePlan = () => {
    if (!planToDelete) return Promise.resolve();
    return axiosInstance
      .delete(`${API_ENDPOINTS.TENANT_PAYMENT_CHECK}${planToDelete.id}/`)
      .then(() => {
        setPlans(plans.filter((plan) => plan.id !== planToDelete.id));
        setFilteredPlans(
          filteredPlans.filter((plan) => plan.id !== planToDelete.id),
        );
        toast.success("Payment record deleted successfully!");
        closeConfirmDelete();
      })
      .catch((error) => {
        console.error("There was an error deleting the record:", error);
        toast.error(
          error.response?.data?.error || "Failed to delete payment record!",
        );
        closeConfirmDelete();
      });
  };

  const handleUpdateClick = (plan) => {
    setSelectedPlan(plan);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (data) => {
    if (!data.name.trim()) {
      toast.error("Plan name is required!");
      return;
    }
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.TENANT_PAYMENT_CHECK}${selectedPlan.id}/`,
        {
          name: data.name,
          price: data.price,
          duration_days: data.duration_days,
          is_active: data.is_active,
        },
      );
      fetchPlans();
      toast.success("Payment record updated successfully!");
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("There was an error updating the record:", error);
      toast.error(
        error.response?.data?.error || "Failed to update payment record!",
      );
    }
  };

  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const displayPlans = filteredPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const Modal = ({ plan, onClose }) => {
    if (!plan) return null;
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl shadow-md">
                <Info className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Payment Details
              </h2>
            </div>

            <div className="space-y-3">
              {/* <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                  <Hash className="w-3 h-3" /> ID
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">#{plan.id}</p>
              </div> */}

              <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                  <Crown className="w-3 h-3" /> Tenant
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{plan.tenant}</p>
              </div>

              <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                  <Crown className="w-3 h-3" /> Plan Name
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {plan.subscriptionPlan?.name}
                </p>
              </div>

              <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                  <DollarSign className="w-3 h-3" /> Price
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  ${plan.subscriptionPlan?.price}
                </p>
              </div>

              <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                  <Hash className="w-3 h-3" /> Duration
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {plan.subscriptionPlan?.duration_days} days
                </p>
              </div>

              <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                  <Check className="w-3 h-3" /> Active
                </p>
                <p
                  className={`font-semibold ${plan.subscriptionPlan?.is_active ? "text-slate-900 dark:text-slate-100" : "text-rose-600 dark:text-rose-400"}`}
                >
                  {plan.subscriptionPlan?.is_active ? "Yes" : "No"}
                </p>
              </div>

              <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                  <Check className="w-3 h-3" /> Payment Status
                </p>
                <p
                  className={`font-semibold ${plan.status === "paid_verified" ? "text-slate-900 dark:text-slate-100" : "text-amber-600 dark:text-amber-400"}`}
                >
                  {formatStatusForDisplay(plan.status)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-slate-200 dark:border-slate-700 w-24"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmDeleteModal = ({ onConfirm, onCancel }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
      setIsDeleting(true);
      try {
        await onConfirm();
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4"
        onClick={() => !isDeleting && onCancel()}
      >
        <div
          className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => !isDeleting && onCancel()}
            disabled={isDeleting}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto w-20 h-20 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6 border-8 border-rose-50/50 dark:border-rose-900/30">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h2 className="mb-3 font-bold text-2xl text-rose-600 dark:text-rose-400">
            Are you sure?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 px-2 text-sm leading-relaxed">
            Do you really want to delete this subscription plan? This action
            cannot be undone.
          </p>

          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded-xl w-32 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 h-11"
            >
              No
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl w-32 shadow-lg shadow-rose-600/20 h-11 min-w-[120px] transition-all active:scale-95"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Yes
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const UpdateModal = ({ onClose, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (data) => {
      setIsSubmitting(true);
      try {
        await onSubmit(data);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4"
        onClick={() => !isSubmitting && onClose()}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <button
              onClick={() => !isSubmitting && onClose()}
              disabled={isSubmitting}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl shadow-md">
                <Pencil className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Update Subscription Plan
              </h2>
            </div>

            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 block">
                  Plan Name
                </label>
                <div className="relative group">
                  <Crown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-slate-400 group-focus-within:text-slate-900 dark:text-slate-100 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    {...register("name", { required: true })}
                    className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 block">
                  Price
                </label>
                <div className="relative group">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-slate-400 group-focus-within:text-slate-900 dark:text-slate-100 transition-colors" />
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    {...register("price", { required: true })}
                    className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 block">
                  Duration (days)
                </label>
                <div className="relative group">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-slate-400 group-focus-within:text-slate-900 dark:text-slate-100 transition-colors" />
                  <input
                    type="number"
                    name="duration_days"
                    {...register("duration_days", { required: true })}
                    className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 block">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    {...register("is_active")}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 dark:text-slate-100 focus:ring-slate-500"
                  />
                  <label
                    htmlFor="is_active"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => !isSubmitting && onClose()}
                  disabled={isSubmitting}
                  className="rounded-xl font-medium disabled:opacity-40"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white rounded-xl shadow-lg shadow-slate-900/20 px-6 font-medium min-w-[120px] transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1  p-4 md:p-8 max-w-7xl mx-auto w-full">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all z-20"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900/10 via-slate-800/5 to-transparent px-6 py-6 border-b border-slate-200/60 dark:border-slate-800">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            <div className="p-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl shadow-lg shadow-slate-900/20">
              <Crown className="h-6 w-6" />
            </div>
            Payment Records
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Filter Toolbar - Select Only */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full max-w-md">
              {/* <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  options={planOptions}
                  isClearable
                  placeholder="Select subscription plan..."
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  onChange={(option) => {
                    setSelectedOption(option);
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      paddingLeft: "2.5rem",
                      borderRadius: "0.75rem",
                      borderColor: "hsl(var(--border))",
                      backgroundColor: "hsl(var(--background))",
                      "&:hover": {
                        borderColor: "hsl(var(--primary))",
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                    }),
                  }}
                />
              </div> */}
            </div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
              Total Plans:{" "}
              <span className="text-slate-900 dark:text-slate-100 font-bold ml-1">
                {filteredPlans.length}
              </span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              {filteredPlans.length > 0 && (
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50/80">
                  <TableRow className="border-b-gray-100">
                    {/* <TableHead className="w-[100px] font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      # ID
                    </TableHead> */}
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-slate-400" />
                        Tenant
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-slate-400" />
                        Plan Name
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        Price
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" />
                        Duration
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-slate-400" />
                        Active
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-slate-400" />
                        Status
                      </div>
                    </TableHead>
                    {!filteredPlans.every((p) => p.status === "paid_verified") && (
                      <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-slate-400" />
                          Retry
                        </div>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
              )}
              <TableBody>
                {displayPlans.length > 0 ? (
                  displayPlans.map((plan) => (
                    <TableRow
                      key={plan.id}
                      className="border-b-gray-50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* <TableCell className="font-medium text-slate-500 dark:text-slate-400">
                        #{plan.id}
                      </TableCell> */}
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        {plan.tenant}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        {plan.subscriptionPlan?.name}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        ${plan.subscriptionPlan?.price}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        {plan.subscriptionPlan?.duration_days} days
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${plan.subscriptionPlan?.is_active
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              : "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                            }`}
                        >
                          <Check className="h-3 w-3" />
                          {plan.subscriptionPlan?.is_active ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(plan.status)}`}
                        >
                          {formatStatusForDisplay(plan.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {plan.payment_url && plan.status !== "paid_verified" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs font-medium rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 transition-all"
                            onClick={() => window.open(plan.payment_url, "_blank")}
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Spinner className="size-6" />
                        <span className="text-sm font-medium text-slate-400">
                          Loading payment records...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : plans.length === 0 && subscriptionPlans.length > 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {subscriptionPlans.map((plan) => {
                          const planName = (plan.name || "").toLowerCase();
                          const Icon =
                            planName.includes("pro") ||
                              planName.includes("enterprise")
                              ? Crown
                              : Zap;
                          return (
                            <Card
                              key={plan.id}
                              className="border shadow-sm rounded-xl hover:shadow-md transition-all duration-200 bg-white"
                            >
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 via-blue-500 to-slate-600" />
                              <CardHeader className="pt-5 pb-3 px-5">
                                <div className="flex items-center justify-between">
                                  <div className="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg shadow-md">
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                  {plan.is_active && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                      <Check className="h-3 w-3" />
                                      Active
                                    </span>
                                  )}
                                </div>
                                <CardTitle className="text-base font-bold mt-3 tracking-tight">
                                  {plan.name}
                                </CardTitle>
                                <CardDescription className="text-sm">
                                  <div className="flex flex-col items-center gap-1">
                                    <DollarSign className="h-5 w-5 text-slate-400" />
                                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                      {plan.price}
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-400">
                                      br/year
                                    </span>
                                  </div>
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="px-5 pb-5">
                                <div className="space-y-2 mb-4">
                                  {getPlanFeatures(plan.name).map(
                                    (feature, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                                      >
                                        <Check className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                        <span>{feature}</span>
                                      </div>
                                    ),
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <Check className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                    <span>
                                      Valid for {plan.duration_days} days
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-lg shadow-md shadow-slate-900/20 transition-all text-sm py-2"
                                  disabled={!plan.is_active}
                                  onClick={() => {
                                    setSelectedSubPlan(plan);
                                    setIsSubDialogOpen(true);
                                  }}
                                >
                                  {plan.is_active
                                    ? "Subscribe Now"
                                    : "Unavailable"}
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-slate-500 dark:text-slate-400 font-medium"
                    >
                      No subscription plans available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {displayPlans.length > 0 ? (
              displayPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-bold rounded-md mb-3">
                        #{plan.id}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Tenant
                      </p>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                        {plan.tenant}
                      </p>
                    </div>
                    {/* DropdownMenu commented out */}
                    {/* <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:bg-slate-800 rounded-full transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-slate-200/60 dark:border-slate-800 p-1">
                        <DropdownMenuItem onClick={() => handleViewClick(plan)} className="cursor-pointer gap-2 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:bg-slate-800/50">
                          <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateClick(plan)} className="cursor-pointer gap-2 py-2 rounded-lg text-slate-900 dark:text-slate-100 font-medium hover:text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:bg-slate-800/50">
                          <Pencil className="h-4 w-4" /> Update
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(plan)} className="cursor-pointer gap-2 py-2 rounded-lg text-rose-600 dark:text-rose-400 font-medium hover:text-rose-700 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 focus:bg-rose-50 dark:focus:bg-rose-900/20 focus:text-rose-700 dark:focus:text-rose-400">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Plan Name
                    </p>
                    <p className="text-slate-900 dark:text-slate-100 text-[15px] font-bold">
                      {plan.subscriptionPlan?.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Price
                      </p>
                      <p className="text-slate-900 dark:text-slate-100 text-[15px] font-bold">
                        ${plan.subscriptionPlan?.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Duration
                      </p>
                      <p className="text-slate-900 dark:text-slate-100 text-[15px] font-bold">
                        {plan.subscriptionPlan?.duration_days} days
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Active
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${plan.subscriptionPlan?.is_active
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                    >
                      <Check className="h-3 w-3" />
                      {plan.subscriptionPlan?.is_active ? "Yes" : "No"}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Status
                    </p>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(plan.status)}`}
                    >
                      {formatStatusForDisplay(plan.status)}
                    </span>
                  </div>

                  {plan.payment_url && plan.status !== "paid_verified" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-10 text-sm font-medium rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:bg-slate-800/50 hover:border-emerald-300 text-slate-700 dark:text-slate-300 transition-all"
                      onClick={() => window.open(plan.payment_url, "_blank")}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Payment
                    </Button>
                  )}
                </div>
              ))
            ) : isLoading ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-200 dark:border-slate-700 text-center shadow-sm flex flex-col items-center gap-3">
                <Spinner className="size-7 text-slate-900 dark:text-slate-100" />
                <span className="text-sm font-medium text-slate-400">
                  Loading payment records...
                </span>
              </div>
            ) : plans.length === 0 && subscriptionPlans.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {subscriptionPlans.map((plan) => {
                  const Icon =
                    plan.name && plan.name.toLowerCase().includes("pro")
                      ? Crown
                      : plan.name.toLowerCase().includes("enterprise")
                        ? Crown
                        : Zap;
                  return (
                    <Card
                      key={plan.id}
                      className="border shadow-sm rounded-xl bg-white"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 via-blue-500 to-slate-600" />
                      <CardHeader className="pt-5 pb-3 px-5">
                        <div className="flex items-center justify-between">
                          <div className="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg shadow-md">
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          {plan.is_active && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              <Check className="h-3 w-3" />
                              Active
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-base font-bold mt-3 tracking-tight">
                          {plan.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          <div className="flex flex-col items-center gap-1">
                            <DollarSign className="h-5 w-5 text-slate-400" />
                            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                              {plan.price}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">/year</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-5 pb-5">
                        <div className="space-y-2 mb-4">
                          {getPlanFeatures(plan.name).map((feature, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                            >
                              <Check className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Check className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                            <span>Valid for {plan.duration_days} days</span>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-lg shadow-md shadow-slate-900/20 transition-all text-sm py-2"
                          disabled={!plan.is_active}
                          onClick={() => {
                            setSelectedSubPlan(plan);
                            setIsSubDialogOpen(true);
                          }}
                        >
                          {plan.is_active ? "Subscribe Now" : "Unavailable"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400 font-medium shadow-sm">
                No subscription plans available.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-muted">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages)
                          pageNum = totalPages - (4 - i);
                      }
                    }
                    if (pageNum <= totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "ghost"
                          }
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="gap-2 rounded-lg"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedPlan && (
        <Modal plan={selectedPlan} onClose={closeModal} />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal
          onConfirm={deletePlan}
          onCancel={closeConfirmDelete}
        />
      )}
      {isUpdateModalOpen && (
        <UpdateModal
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={handleUpdateSubmit}
        />
      )}

      {isSubDialogOpen && selectedSubPlan && (
        <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center space-y-3 pb-4">
              <div className="mx-auto w-16 h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl">
                Confirm Subscription
              </DialogTitle>
              <DialogDescription className="text-base">
                You are about to subscribe to the{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedSubPlan?.name}
                </span>{" "}
                plan
              </DialogDescription>
            </DialogHeader>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Plan Price</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ${selectedSubPlan?.price}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-slate-600 dark:text-slate-400">Duration</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedSubPlan?.duration_days} days
                </span>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setIsSubDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-lg shadow-slate-900/20"
                disabled={isSubProcessing}
                onClick={async () => {
                  try {
                    setIsSubProcessing(true);
                    const response = await axiosInstance.post(
                      `${API_ENDPOINTS.TENANT_PAY}/`,
                      { plan: selectedSubPlan?.id },
                    );
                    const { payment_url } = response.data;
                    window.open(payment_url, "_blank");
                    setIsSubDialogOpen(false);
                  } catch (err) {
                    console.error("Payment initiation failed:", err);
                  } finally {
                    setIsSubProcessing(false);
                  }
                }}
              >
                {isSubProcessing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirm & Subscribe
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
