import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { MoreVertical, Pencil, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Hash, User, Search, Plus, Layers, Wallet } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";

// Define your Zod schema for expense type
const expenseTypeSchema = z.object({
  expenseType: z.string().min(1, { message: "Expense type is required" }),
});
// Define your Zod schema for expense
const expenseSchema = z.object({
  cost: z.number().min(0, { message: "Cost must be a positive number" }),
  expenseType: z.string().min(1, { message: "Expense type is required" }),
});

const AddExpense = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [selectedExpenseType, setSelectedExpenseType] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});
  const itemsPerPage = 10;

  const {
    control: expenseTypeControl,
    handleSubmit: handleExpenseTypeSubmit,
    reset: resetExpenseType,
    setValue,
    formState: { errors: expenseTypeErrors },
  } = useForm({
    resolver: zodResolver(expenseTypeSchema),
  });

  const {
    control: expenseControl,
    handleSubmit: handleExpenseSubmit,
    reset: resetExpense,
    formState: { errors: expenseErrors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  // Function to fetch expense types
  const fetchExpenseTypes = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.EXPENSE_TYPE);
      // Sort expense types by 'id' in descending order
      const sortedExpenseTypes = response.data.sort((a, b) => b.id - a.id);
      setExpenseTypes(sortedExpenseTypes);
    } catch (error) {
      console.error("Error fetching expense types:", error);
      toast.error("Failed to load expense types.");
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  useEffect(() => {
    if (selectedExpenseType) {
      setValue("expenseType", selectedExpenseType.name);
    }
  }, [selectedExpenseType, setValue]);

  // Handle adding new expense type
  const handleAddExpenseType = async (data) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.EXPENSE_TYPE, {
        name: data.expenseType,
      });
      if (response.status === 200) {
        toast.success("Expense type added successfully!");
      }
      fetchExpenseTypes();
      resetExpenseType();
    } catch (error) {
      console.error("Error posting expense type:", error);
      toast.error("Failed to add expense type. Please try again.");
    }
  };

  // Handle submitting the expense form
  const handleSubmitExpense = async (data) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.OTHER_EXPENSE, {
        expense_type: data.expenseType,
        cost: data.cost,
      });
      toast.success("Expense added successfully!");
      resetExpense();
    } catch (error) {
      console.error("Error posting expense:", error);
      toast.error("Failed to add expense. Please try again.");
    }
  };

  // Handle updating an expense type
  const handleUpdateExpenseType = async (data) => {
    try {
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.EXPENSE_TYPE}/${selectedExpenseType.id}`,
        { name: data.expenseType }
      );
      toast.success("Expense type updated successfully!");
      fetchExpenseTypes();
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("Error updating expense type:", error);
      toast.error("Failed to update expense type. Please try again.");
    }
  };

  // Handle deleting an expense type
  const handleDeleteExpenseType = async () => {
    try {
      const response = await axiosInstance.delete(
        `${API_ENDPOINTS.EXPENSE_TYPE}/${selectedExpenseType.id}`
      );
      toast.success("Expense type deleted successfully!");
      fetchExpenseTypes();
      setIsConfirmDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting expense type:", error);
      toast.error("Failed to delete expense type. Please try again.");
    }
  };

  const handleUpdateClick = (expenseType) => {
    setSelectedExpenseType(expenseType);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (expenseType) => {
    setSelectedExpenseType(expenseType);
    setIsConfirmDeleteOpen(true);
  };

  const closeModal = () => {
    setIsUpdateModalOpen(false);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredExpenseTypes = expenseTypes.filter((type) => {
    return type.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pageCount = Math.ceil(filteredExpenseTypes.length / itemsPerPage);
  const displayExpenseTypes = filteredExpenseTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Define columns for DataGrid
  const columns = [
    { field: "id", headerName: t("id"), width: 100 },
    { field: "name", headerName: t("expense_type"), width: 200 },
    { field: "user", headerName: t("created_by"), width: 200 },
    {
      field: "actions",
      headerName: t("actions"),
      width: 150,
      renderCell: (params) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleUpdateClick(params.row.actions)}
            >
              <Pencil className="mr-2 h-4 w-4 text-yellow-500" />
              {t("update")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteClick(params.row.actions)}
            >
              <Trash2 className="mr-2 h-4 w-4 text-red-600" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Prepare rows for DataGrid
  const rows = displayExpenseTypes.map((type, index) => ({
    id: (currentPage - 1) * itemsPerPage + index + 1,
    name: type.name,
    user: type.user,
    actions: type,
  }));

  const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden mt-20 md:mt-0" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400"><Trash2 className="h-5 w-5" /></div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("are_you_sure")}</h2>
          </div>
        </div>
        <div className="p-6"><p className="text-slate-600 dark:text-slate-400">{t("sure_discription_expenseType")}</p></div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
          <Button onClick={onCancel} className="rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-6">{t("cancel")}</Button>
          <Button onClick={onConfirm} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-6">{t("delete")}</Button>
        </div>
      </div>
    </div>
  );

  const UpdateModal = ({ expenseType, onClose, onSubmit }) => {
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(expenseTypeSchema),
      defaultValues: {
        expenseType: expenseType?.name || "",
      },
    });
    return (
      <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400"><Pencil className="h-5 w-5" /></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("update_expense_type")}</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("expense_type")}</label>
              <Controller
                name="expenseType"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={`rounded-xl border ${errors.expenseType ? "border-rose-400 dark:border-rose-500" : "border-slate-200 dark:border-slate-700"} bg-white dark:bg-slate-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all`}
                  />
                )}
              />
              {errors.expenseType && <p className="mt-2 text-sm text-rose-500">{errors.expenseType.message}</p>}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <Button type="button" onClick={onClose} className="rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-6">{t("cancel")}</Button>
              <Button type="submit" className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white px-6">{t("update")}</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="px-5 mt-10 md:mt-0 min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-background md:p-8 lg:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full mx-auto space-y-12">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 tracking-tight">
            {t("add_expense")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
            Record new expenses and manage expense categories to keep your finances organized.
          </p>
        </div>

        {/* Form Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Expense Type Card */}
          <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{t("expense_type")}</h3>
            </div>
            <form onSubmit={handleExpenseTypeSubmit(handleAddExpenseType)} className="space-y-4">
              <div className="space-y-2">
                <Controller
                  name="expenseType"
                  control={expenseTypeControl}
                  defaultValue=""
                  render={({ field }) => (
                    <div>
                      <Input
                        placeholder={t("add_expense_type")}
                        {...field}
                        className={`rounded-xl h-12 border ${expenseTypeErrors.expenseType ? "border-rose-400" : "border-slate-200 dark:border-slate-700"} bg-white dark:bg-slate-800 px-4 focus:ring-2 focus:ring-blue-500/40`}
                      />
                      {expenseTypeErrors.expenseType && (
                        <p className="mt-1.5 text-xs text-rose-500 font-medium">{expenseTypeErrors.expenseType.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="w-auto bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white rounded-xl h-12 px-8 font-semibold transition-all">
                  {t("add_expense_type")}
                </Button>
              </div>
            </form>
          </div>

          {/* Submit Expense Card */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{t("submit_expense")}</h3>
            </div>
            <form onSubmit={handleExpenseSubmit(handleSubmitExpense)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("select_expense_type")}</label>
                <Controller
                  name="expenseType"
                  control={expenseControl}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">{t("select_expense_type")}</option>
                      {expenseTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  )}
                />
                {expenseErrors.expenseType && (
                  <p className="mt-1.5 text-xs text-rose-500 font-medium">{expenseErrors.expenseType.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("cost")}</label>
                <Controller
                  name="cost"
                  control={expenseControl}
                  defaultValue=""
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        placeholder={t("enter_cost")}
                        type="number"
                        {...field}
                        value={field.value !== undefined ? field.value : ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className={`rounded-xl h-12 border ${expenseErrors.cost ? "border-rose-400" : "border-slate-200 dark:border-slate-700"} bg-white dark:bg-slate-800 pl-4 pr-12 focus:ring-2 focus:ring-blue-500/40`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">ETB</div>
                      {expenseErrors.cost && (
                        <p className="mt-1.5 text-xs text-rose-500 font-medium">{expenseErrors.cost.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
              <div className="md:col-span-2 pt-2 flex justify-end">
                <Button type="submit" className="w-auto bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white rounded-xl h-12 px-8 font-semibold transition-all">
                  {t("submit_expense")}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Expense Type Management Table Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("manage_expense_type")}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Search and edit your expense categories.</p>
            </div>
            <div className="relative flex items-center gap-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 h-11 shadow-sm w-full sm:w-[280px]">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="search"
                placeholder={t("search_expense_type")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 h-8"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100/80 dark:border-slate-800">
                  <tr>
                    <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 pl-8 text-sm">ID</th>
                    <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm">EXPENSE TYPE</th>
                    <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm">CREATED BY</th>
                    <th className="text-right font-semibold text-slate-600 dark:text-slate-400 h-14 pr-8 text-sm">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {displayExpenseTypes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Layers className="h-6 w-6" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">{t("no_data_found")}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayExpenseTypes.map((type, index) => (
                      <tr key={type.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="py-4 pl-8">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                            <Hash className="h-3.5 w-3.5 mr-1 text-slate-400" />
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </span>
                        </td>
                        <td className="py-4 font-semibold text-slate-900 dark:text-slate-100">{type.name}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{type.user}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-8 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdateClick(type)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 shadow-sm transition-all flex items-center justify-center" title={t("update")}>
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteClick(type)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 shadow-sm transition-all flex items-center justify-center" title={t("delete")}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredExpenseTypes.length > 0 && (
              <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100/80 dark:border-slate-800 px-8 py-4 text-sm flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[24px]">
                <span className="text-slate-500 dark:text-slate-400">Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{displayExpenseTypes.length}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredExpenseTypes.length}</span> types</span>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 rounded-lg shadow-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3 text-sm">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <span className="text-slate-600 dark:text-slate-400 font-medium px-2">Page {currentPage} of {pageCount || 1}</span>
                  <Button onClick={() => setCurrentPage(p => (!pageCount || p >= pageCount ? p : p + 1))} disabled={!pageCount || currentPage >= pageCount} className="h-8 rounded-lg shadow-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3 text-sm">
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4">
            {displayExpenseTypes.map((type) => (
              <div key={type.id} className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg rounded-[20px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-5 relative transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">{t("expense_type")}</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-none">{type.name}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/50 mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t("created_by")}</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-slate-400" />{type.user}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100/80 dark:border-slate-800">
                  <button onClick={() => handleUpdateClick(type)} className="flex-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 bg-slate-50 dark:bg-slate-800/50 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Pencil className="h-4 w-4" /> {t("update")}
                  </button>
                  <button onClick={() => handleDeleteClick(type)} className="flex-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 bg-slate-50 dark:bg-slate-800/50 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Trash2 className="h-4 w-4" /> {t("delete")}
                  </button>
                </div>
              </div>
            ))}
            {filteredExpenseTypes.length > 0 && (
              <div className="flex flex-col items-center gap-3 pt-4 pb-6">
                <span className="text-xs text-slate-400 dark:text-slate-500">Showing {displayExpenseTypes.length} of {filteredExpenseTypes.length} types</span>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-9 w-9 p-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                    <ChevronLeft className="h-4 w-4 mx-auto" />
                  </Button>
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-bold px-3">Page {currentPage} of {pageCount || 1}</span>
                  <Button onClick={() => setCurrentPage(p => (!pageCount || p >= pageCount ? p : p + 1))} disabled={!pageCount || currentPage >= pageCount} className="h-9 w-9 p-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                    <ChevronRight className="h-4 w-4 mx-auto" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isUpdateModalOpen && selectedExpenseType && (
        <UpdateModal expenseType={selectedExpenseType} onClose={closeModal} onSubmit={handleUpdateExpenseType} />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal onConfirm={handleDeleteExpenseType} onCancel={closeConfirmDelete} />
      )}
    </div>
  );
};

export default AddExpense;
