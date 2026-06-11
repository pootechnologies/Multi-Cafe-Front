import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { formatTimestamp } from "@/utils/timeFormater";
import { t } from "i18next";
import { MoreVertical, Pencil, Trash2, Eye, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Hash, User, Search, Wallet, Calendar } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { formatCurrency } from "@/utils/numberFormaterStats";

// Define your Zod schema for expense
const expenseSchema = z.object({
  cost: z.number().min(0, { message: "Cost must be a positive number" }),
  expenseType: z.string().min(1, { message: "Expense type is required" }),
});

const ManageExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpenseType, setSelectedExpenseType] = useState("");
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});
  const itemsPerPage = 10;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  // Function to fetch expenses
  const fetchExpenses = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.OTHER_EXPENSE);
      // Sort expenses by 'created_at' in descending order
      const sortedExpenses = response.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setExpenses(sortedExpenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses.");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (selectedExpense) {
      setValue("expenseType", selectedExpense.expense_type);
      setValue("cost", selectedExpense.cost);
    }
  }, [selectedExpense, setValue]);

  useEffect(() => {
    // Extract unique expense types
    const uniqueExpenseTypes = Array.from(
      new Set(expenses.map((expense) => expense.expense_type))
    );
    setExpenseTypes(uniqueExpenseTypes);
  }, [expenses]);

  // Handle updating an expense
  const handleUpdateExpense = async (data) => {
    try {
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.OTHER_EXPENSE}/${selectedExpense.id}`,
        { cost: data.cost }, // Only send the cost field
      );
      toast.success("Expense updated successfully!");
      fetchExpenses();
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Failed to update expense. Please try again.");
    }
  };

  // Handle deleting an expense
  const handleDeleteExpense = async () => {
    try {
      const response = await axiosInstance.delete(
        `${API_ENDPOINTS.OTHER_EXPENSE}/${selectedExpense.id}`
      );
      toast.success("Expense deleted successfully!");
      fetchExpenses();
      setIsConfirmDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense. Please try again.");
    }
  };

  const handleViewClick = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (expense) => {
    setSelectedExpense(expense);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setIsConfirmDeleteOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsUpdateModalOpen(false);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleExpenseTypeChange = (event) => {
    setSelectedExpenseType(event.target.value);
    setCurrentPage(1); // Reset to the first page when filtering
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.expense_type
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase()) ||
      expense.cost?.toString()?.includes(searchQuery);
    const matchesType =
      selectedExpenseType === "" ||
      expense.expense_type === selectedExpenseType;
    return matchesSearch && matchesType;
  });

  const pageCount = Math.ceil(filteredExpenses.length / itemsPerPage);
  const displayExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Define columns for DataGrid
  const columns = [
    { field: "id", headerName: t("id"), width: 100 },
    { field: "expense_type", headerName: t("expense_type"), width: 200 },
    { field: "cost", headerName: t("cost"), width: 150 },
    { field: "created_at", headerName: t("created_at"), width: 200 },
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
            <DropdownMenuItem onClick={() => handleViewClick(params.row)}>
              <Eye className="mr-2 h-4 w-4 text-blue-500" />
              {t("view")}
            </DropdownMenuItem>
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
  const rows = displayExpenses.map((expense) => ({
    id: expense.id,
    expense_type: expense.expense_type,
    cost: expense.cost,
    created_at: formatTimestamp(expense.created_at),
    user: expense.user,
    actions: expense,
  }));

  const Modal = ({ expense, onClose }) => {
    if (!expense) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("expense_details")}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">{t("expense_type")}</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{expense.expense_type}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t("cost")}</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(expense.cost)} ETB</p>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t("id")}</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">#{expense.id}</p>
              </div>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t("created_at")}</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {formatTimestamp(expense.created_at)}
              </p>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t("created_by")}</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                {expense.user}
              </p>
            </div>
          </div>
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <Button onClick={onClose} className="w-full rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white font-semibold h-12 shadow-lg transition-all">
              {t("close")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden mt-20 md:mt-0" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("are_you_sure")}</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400">{t("sure_discription_expense")}</p>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
          <Button onClick={onCancel} className="rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-6">
            {t("cancel")}
          </Button>
          <Button onClick={onConfirm} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-6">
            {t("delete")}
          </Button>
        </div>
      </div>
    </div>
  );

  const UpdateModal = ({ expense, onClose, onSubmit }) => {
    return (
      <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Pencil className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("update_expense")}</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("expense_type")}</label>
                <div className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 flex items-center text-slate-500 dark:text-slate-400 font-medium">
                  {expense?.expense_type}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("cost")}</label>
                <div className="relative">
                  <Input
                    step="0.01"
                    type="number"
                    {...register("cost", {
                      valueAsNumber: true,
                      setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                    })}
                    className={`rounded-xl h-12 border ${errors.cost ? "border-rose-400" : "border-slate-200 dark:border-slate-700"} bg-white dark:bg-slate-800 pl-4 pr-12 focus:ring-2 focus:ring-blue-500/40`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">ETB</div>
                </div>
                {errors.cost && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.cost.message}</p>}
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <Button type="button" onClick={onClose} className="rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-6">{t("cancel")}</Button>
              <Button type="submit" className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white px-6 font-semibold">{t("update")}</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="px-5 mt-10 md:mt-0 min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-background md:p-8 lg:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 tracking-tight">
              {t("manage_expense")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
              Track and monitor all your business expenses in one place.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex items-center gap-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 h-12 shadow-sm w-full sm:w-fit">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="search"
                placeholder={t("search_expense")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 sm:w-[180px] bg-transparent border-0 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 h-8"
              />
            </div>
            <select
              value={selectedExpenseType}
              onChange={handleExpenseTypeChange}
              className="h-12 rounded-xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none shadow-sm cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-colors"
            >
              <option value="">{t("all_expense_types")}</option>
              {expenseTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full">
              <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100/80 dark:border-slate-800">
                <tr>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 pl-8 text-sm">ID</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm">EXPENSE TYPE</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm">COST</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm">DATE</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm">CREATED BY</th>
                  <th className="text-right font-semibold text-slate-600 dark:text-slate-400 h-14 pr-8 text-sm">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {displayExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-96">
                      <div className="flex flex-col items-center justify-center text-center h-full space-y-4">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center shadow-sm border border-blue-100 dark:border-blue-900/50">
                          <Wallet className="h-10 w-10 opacity-80" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t("no_data_found")}</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Try adjusting your search or filters.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group h-20">
                      <td className="py-4 pl-8">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                          <Hash className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          {expense.id}
                        </span>
                      </td>
                      <td className="py-4"><span className="font-bold text-slate-900 dark:text-slate-100">{expense.expense_type}</span></td>
                      <td className="py-4"><span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(expense.cost)} ETB</span></td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                          <Calendar className="h-3.5 w-3.5 opacity-60" />
                          {formatTimestamp(expense.created_at)}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{expense.user}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewClick(expense)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm transition-all flex items-center justify-center" title={t("view")}>
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleUpdateClick(expense)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 shadow-sm transition-all flex items-center justify-center" title={t("update")}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(expense)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 shadow-sm transition-all flex items-center justify-center" title={t("delete")}>
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
          {filteredExpenses.length > 0 && (
            <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100/80 dark:border-slate-800 px-8 py-4 text-sm flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[24px]">
              <span className="text-slate-500 dark:text-slate-400">Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{displayExpenses.length}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredExpenses.length}</span> expenses</span>
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
          {displayExpenses.map((expense) => (
            <div key={expense.id} className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg rounded-[20px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-5 relative transition-shadow hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">{expense.expense_type}</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xl leading-none">{formatCurrency(expense.cost)} ETB</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                  <Hash className="h-3 w-3 mr-1 text-slate-400" />
                  {expense.id}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t("created_at")}</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {formatTimestamp(expense.created_at)}
                  </p>
                </div>
              </div>

              {expandedCards[expense.id] && (
                <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t("created_by")}</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {expense.user}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setExpandedCards(prev => {
                  const isEx = prev[expense.id];
                  return isEx ? {} : { [expense.id]: true };
                })}
                className="w-full mb-4 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                {expandedCards[expense.id] ? (
                  <><span>Hide Details</span><ChevronUp className="h-4 w-4" /></>
                ) : (
                  <><span>Show Details</span><ChevronDown className="h-4 w-4" /></>
                )}
              </button>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100/80 dark:border-slate-800">
                <button onClick={() => handleViewClick(expense)} className="flex-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-slate-50 dark:bg-slate-800/50 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Eye className="h-4 w-4" /> {t("view")}
                </button>
                <button onClick={() => handleUpdateClick(expense)} className="flex-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 bg-slate-50 dark:bg-slate-800/50 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Pencil className="h-4 w-4" /> {t("update")}
                </button>
                <button onClick={() => handleDeleteClick(expense)} className="flex-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 bg-slate-50 dark:bg-slate-800/50 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Trash2 className="h-4 w-4" /> {t("delete")}
                </button>
              </div>
            </div>
          ))}

          {filteredExpenses.length > 0 && (
            <div className="flex flex-col items-center gap-3 pt-4 pb-6">
              <span className="text-xs text-slate-400 dark:text-slate-500">Showing {displayExpenses.length} of {filteredExpenses.length} expenses</span>
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

      {/* Modals */}
      {isModalOpen && selectedExpense && (
        <Modal expense={selectedExpense} onClose={closeModal} />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal onConfirm={handleDeleteExpense} onCancel={closeConfirmDelete} />
      )}
      {isUpdateModalOpen && selectedExpense && (
        <UpdateModal expense={selectedExpense} onClose={closeModal} onSubmit={handleUpdateExpense} />
      )}
    </div>
  );
};

export default ManageExpense;
