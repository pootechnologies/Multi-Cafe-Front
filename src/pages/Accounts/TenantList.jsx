import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";


import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Select from "react-select";
import {
  Eye,
  Pencil,
  Trash2,
  Building2,
  Search,
  AlertTriangle,
  X,
  Hash,
  Calendar,
  Check,
  Mail,
  Database,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";

const TenantList = () => {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [trialFilter, setTrialFilter] = useState(null);

  const trialOptions = [
    { value: null, label: "All" },
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
         `${API_ENDPOINTS.TENANT_PROVISION}`
      );
      const data = response.data.results || [];
      const sortedTenants = [...data].sort((a, b) => b.id - a.id);
      setTenants(sortedTenants);
      setFilteredTenants(sortedTenants);
    } catch (error) {
      console.error("There was an error fetching the data:", error);
      toast.error("Failed to fetch tenants");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
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

  useEffect(() => {
    let result = [...tenants];
    if (trialFilter !== null) {
      result = result.filter((tenant) => tenant.on_trial === trialFilter);
    }
    setFilteredTenants(result);
    setCurrentPage(1);
  }, [trialFilter, tenants]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewClick = (tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (tenant) => {
    setTenantToDelete(tenant);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const deleteTenant = () => {
    if (!tenantToDelete) return Promise.resolve();
    return axiosInstance
      .delete(`${API_ENDPOINTS.TENANT_PROVISION}${tenantToDelete.id}/`)
      .then(() => {
        setTenants(tenants.filter((tenant) => tenant.id !== tenantToDelete.id));
        setFilteredTenants(filteredTenants.filter((tenant) => tenant.id !== tenantToDelete.id));
        toast.success("Tenant deleted successfully!");
        closeConfirmDelete();
      })
      .catch((error) => {
        console.error("There was an error deleting the tenant:", error);
        toast.error(error.response?.data?.error || "Failed to delete tenant!");
        closeConfirmDelete();
      });
  };

  const handleUpdateClick = (tenant) => {
    setSelectedTenant(tenant);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (data) => {
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.TENANT_PROVISION}${selectedTenant.id}/`,
        data
      );
      fetchTenants();
      toast.success("Tenant updated successfully!");
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("There was an error updating the tenant:", error);
      toast.error(error.response?.data?.error || "Failed to update tenant!");
    }
  };

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const displayTenants = filteredTenants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const Modal = ({ tenant, onClose }) => {
    if (!tenant) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-200/60 dark:border-slate-800">
            <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl shadow-md">
                <Info className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Tenant Details
              </h2>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-3">
            <div className="border border-slate-200/60 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                <Hash className="w-3 h-3" /> ID
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">#{tenant.id}</p>
            </div>

            <div className="border border-slate-200/60 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                <Building2 className="w-3 h-3" /> Name
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{tenant.name}</p>
            </div>

            <div className="border border-slate-200/60 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                <Database className="w-3 h-3" /> Schema Name
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{tenant.schema_name}</p>
            </div>

            <div className="border border-slate-200/60 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                <Calendar className="w-3 h-3" /> Paid Until
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{tenant.paid_until}</p>
            </div>

            <div className="border border-slate-200/60 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                <Check className="w-3 h-3" /> On Trial
              </p>
              <p className={`font-semibold ${tenant.on_trial ? 'text-slate-700 dark:text-slate-300' : 'text-rose-600 dark:text-rose-400'}`}>
                {tenant.on_trial ? 'Yes' : 'No'}
              </p>
            </div>

            <div className="border border-slate-200/60 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                <Mail className="w-3 h-3" /> Email
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{tenant.owner?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200/60 dark:border-slate-800 flex justify-end">
            <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 w-24">
              Close
            </Button>
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => !isDeleting && onCancel()}>
        <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl relative text-center p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <button onClick={() => !isDeleting && onCancel()} disabled={isDeleting} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto w-20 h-20 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6 border-8 border-rose-50/50 dark:border-rose-900/30">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h2 className="mb-3 font-bold text-2xl text-rose-600 dark:text-rose-400">
            Are you sure?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 px-2 text-sm leading-relaxed">
            Do you really want to delete this tenant? This action cannot be undone.
          </p>

          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded-xl w-32 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-11"
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
    const [formData, setFormData] = useState({
      name: selectedTenant?.name || '',
      paid_until: selectedTenant?.paid_until || '',
      on_trial: selectedTenant?.on_trial || false,
    });

    const handleFormSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4" onClick={() => !isSubmitting && onClose()}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <button onClick={() => !isSubmitting && onClose()} disabled={isSubmitting} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md">
                <Pencil className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400">
                Update Tenant
              </h2>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">
                  Tenant Name
                </label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">
                  Paid Until
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                  <input
                    type="date"
                    value={formData.paid_until}
                    onChange={(e) => setFormData({ ...formData, paid_until: e.target.value })}
                    className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-slate-500/50 focus:ring-slate-500/20 rounded-xl transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">
                  Trial Status
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="on_trial"
                    checked={formData.on_trial}
                    onChange={(e) => setFormData({ ...formData, on_trial: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <label htmlFor="on_trial" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    On Trial
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6">
                <Button type="button" variant="ghost" onClick={() => !isSubmitting && onClose()} disabled={isSubmitting} className="rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">
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
              <Building2 className="h-6 w-6" />
            </div>
            Tenant List
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full max-w-xs">
              <div className="relative group">
                <Select
                  options={trialOptions}
                  value={trialOptions.find((opt) => opt.value === trialFilter)}
                  onChange={(option) => setTrialFilter(option ? option.value : null)}
                  placeholder="Filter by On Trial..."
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.75rem",
                      borderColor: "hsl(var(--border))",
                      backgroundColor: "hsl(var(--background))",
                      minHeight: "2.5rem",
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
              </div>
            </div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
              Total Tenants: <span className="text-slate-900 dark:text-slate-100 font-bold ml-1">{filteredTenants.length}</span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
                <TableRow className="border-b-slate-200/60 dark:border-b-slate-800">
                  <TableHead className="w-[100px] font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap"># ID</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      Name
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-400" />
                      Schema Name
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Paid Until
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-slate-400" />
                      On Trial
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      Email
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTenants.length > 0 ? (
                  displayTenants.map((tenant) => (
                    <TableRow key={tenant.id} className="border-b-slate-200/60 dark:border-b-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="font-medium text-slate-500 dark:text-slate-400">#{tenant.id}</TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{tenant.name}</TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{tenant.schema_name}</TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{tenant.paid_until}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tenant.on_trial
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                          : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}>
                          <Check className="h-3 w-3" />
                          {tenant.on_trial ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{tenant.owner?.email || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewClick(tenant)} className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm transition-all flex items-center justify-center" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleUpdateClick(tenant)} className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 shadow-sm transition-all flex items-center justify-center" title="Update">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(tenant)} className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 shadow-sm transition-all flex items-center justify-center" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Spinner className="size-6" />
                        <span className="text-sm font-medium text-slate-400">Loading tenants...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-slate-500 dark:text-slate-400 font-medium">
                      No tenants found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {displayTenants.length > 0 ? (
              displayTenants.map((tenant) => (
                <div key={tenant.id} className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg rounded-[20px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-slate-100/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold rounded-md mb-3">
                        #{tenant.id}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Name
                      </p>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                        {tenant.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewClick(tenant)} className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleUpdateClick(tenant)} className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center justify-center transition-colors" title="Update">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteClick(tenant)} className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Schema Name
                      </p>
                      <p className="text-slate-900 dark:text-slate-100 text-[15px] font-bold">{tenant.schema_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Paid Until
                      </p>
                      <p className="text-slate-900 dark:text-slate-100 text-[15px] font-bold">{tenant.paid_until}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        On Trial
                      </p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tenant.on_trial
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                        : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}>
                        <Check className="h-3 w-3" />
                        {tenant.on_trial ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Email
                      </p>
                      <p className="text-slate-900 dark:text-slate-100 text-[15px] font-bold">{tenant.owner?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : isLoading ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center shadow-sm flex flex-col items-center gap-3">
                <Spinner className="size-7 text-slate-900 dark:text-slate-100" />
                <span className="text-sm font-medium text-slate-400">Loading tenants...</span>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 font-medium shadow-sm">
                No tenants found.
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
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                    }
                    if (pageNum <= totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "ghost"}
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

      {isModalOpen && selectedTenant && (
        <Modal tenant={selectedTenant} onClose={closeModal} />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal
          onConfirm={deleteTenant}
          onCancel={closeConfirmDelete}
        />
      )}
      {isUpdateModalOpen && (
        <UpdateModal
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={handleUpdateSubmit}
        />
      )}
    </div>
  );
};

export default TenantList;
