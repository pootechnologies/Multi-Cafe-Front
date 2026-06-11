import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL, API_ENDPOINTS } from "../../utils/apiConfig";
import { useForm } from "react-hook-form";
import axiosInstance from "../../utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { t } from "i18next";
import { Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Hash, User, Layers, Search, ChevronUp } from "lucide-react";

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedCards, setExpandedCards] = useState({});

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
      const sortedCategories = response?.data?.results?.sort((a, b) => b.id - a.id);
      setCategories(sortedCategories);
      setFilteredCategories(sortedCategories);
    } catch (error) {
      console.error("There was an error fetching the data:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
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
    if (selectedCategory) {
      setValue("name", selectedCategory.name);
    }
  }, [selectedCategory, setValue]);

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(query)
      );
      setFilteredCategories(filtered);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  useEffect(() => {
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

  const handleViewClick = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const deleteCategory = () => {
    if (!categoryToDelete) return;
    axiosInstance
      .delete(`${API_ENDPOINTS.CATEGORIES}${categoryToDelete.id}/`)
      .then(() => {
        setCategories(
          categories.filter((category) => category.id !== categoryToDelete.id)
        );
        setFilteredCategories(
          filteredCategories.filter(
            (category) => category.id !== categoryToDelete.id
          )
        );
        toast.success("Category deleted successfully!");
        closeConfirmDelete();
      })
      .catch((error) => {
        console.error("There was an error deleting the category:", error);
        toast.error(
          error.response?.data?.error || "Failed to delete category!"
        );
        closeConfirmDelete();
      });
  };

  const handleUpdateClick = (category) => {
    setSelectedCategory(category);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (data) => {
    if (!data.name.trim()) {
      toast.error("Category name is required!");
      return;
    }
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.CATEGORIES}${selectedCategory.id}/`,
        {
          name: data.name,
        }
      );
      fetchCategories();
      toast.success("Category name updated successfully!");
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("There was an error updating the category name:", error);
      toast.error(error.response?.data?.error || "Failed to update category!");
    }
  };

  const handleCreateCategory = (data) => {
    if (!data.name.trim()) {
      toast.error("Category name is required!");
      return;
    }
    axiosInstance
      .post(
        `${API_ENDPOINTS.CATEGORIES}`,
        {
          name: data.name,
        }
      )
      .then((response) => {
        const newCategory = response.data;
        setCategories([newCategory, ...categories]);
        setFilteredCategories([newCategory, ...filteredCategories]);
        toast.success("Category created successfully!");
        reset();
      })
      .catch((error) => {
        console.error("There was an error creating the category:", error);
        toast.error(
          error.response?.data?.error || "Failed to create category!"
        );
      });
  };

  const Modal = ({ category, onClose }) => {
    if (!category) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"><Eye className="h-5 w-5" /></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("category_details")}</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t("name")}</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{category.name}</p>
            </div>
          </div>
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
            <Button onClick={onClose} className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white px-6">{t("cancel")}</Button>
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
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400"><Trash2 className="h-5 w-5" /></div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("are_you_sure")}</h2>
          </div>
        </div>
        <div className="p-6"><p className="text-slate-600 dark:text-slate-400">{t("sure_discription_category")}</p></div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
          <Button onClick={onCancel} className="rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-6">{t("cancel")}</Button>
          <Button onClick={onConfirm} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-6">{t("delete")}</Button>
        </div>
      </div>
    </div>
  );

  const UpdateModal = ({ onClose, onSubmit }) => {
    const [isEmpty, setIsEmpty] = useState(false);
    const handleInputChange = (e) => { setIsEmpty(e.target.value.trim() === ""); };
    return (
      <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400"><Pencil className="h-5 w-5" /></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("update_category")}</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("category_name")}</label>
              <input type="text" {...register("name", { required: true })} className={`w-full rounded-xl border ${isEmpty ? "border-rose-400 dark:border-rose-500" : "border-slate-200 dark:border-slate-700"} bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all`} onChange={handleInputChange} />
              {isEmpty && <p className="mt-2 text-sm text-rose-500">Category name is required</p>}
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

  const CreateCategoryModal = ({ onClose, onSubmit }) => {
    return (
      <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Plus className="h-5 w-5" /></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create Category</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category Name</label>
              <input type="text" {...register("name", { required: true })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
              {errors.name && <p className="mt-2 text-sm text-rose-500">Category name is required</p>}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <Button type="button" onClick={onClose} className="rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-6">Cancel</Button>
              <Button type="submit" className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white px-6">Create Category</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const pageCount = Math.ceil(filteredCategories?.length / itemsPerPage);
  const displayCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="px-5 mt-10 md:mt-0 min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-background md:p-8 lg:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 tracking-tight">
              {t("manage_category")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
              View, search, and manage all menu categories. Organize your products efficiently.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex items-center gap-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 h-12 shadow-sm w-full sm:w-fit">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="search"
                placeholder={t("search_categories...")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 sm:w-[180px] bg-transparent border-0 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 h-8"
              />
            </div>
            <Button
              onClick={() => { reset(); setIsCreateModalOpen(true); }}
              className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 rounded-xl h-12 px-6 font-semibold"
            >
              <Plus className="h-5 w-5" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 overflow-hidden relative">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full">
              <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100/80 dark:border-slate-800">
                <tr>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 pl-8 text-sm">ID</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm">CATEGORY</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm">CREATED BY</th>
                  <th className="text-right font-semibold text-slate-600 dark:text-slate-400 h-14 pr-8 text-sm">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {displayCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="h-96">
                      <div className="flex flex-col items-center justify-center text-center h-full space-y-4">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-2 shadow-sm border border-blue-100 dark:border-blue-900/50">
                          <Layers className="h-10 w-10 opacity-80" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">No categories found</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Get started by adding a new category. Click the button above to create one.</p>
                        </div>
                        <Button
                          onClick={() => { reset(); setIsCreateModalOpen(true); }}
                          className="mt-4 rounded-xl font-medium border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Category
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayCategories.map((category) => (
                    <tr key={category.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group h-20">
                      <td className="py-4 pl-8">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                          <Hash className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          {category.id}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-750 group-hover:border-blue-100 dark:group-hover:border-blue-900 group-hover:text-blue-600 transition-colors shadow-sm">
                            <Layers className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-slate-600 dark:text-slate-300 text-sm">{category.user}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewClick(category)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm transition-all flex items-center justify-center" title={t("view")}>
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleUpdateClick(category)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 shadow-sm transition-all flex items-center justify-center" title={t("update")}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(category)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 shadow-sm transition-all flex items-center justify-center" title={t("delete")}>
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
          {displayCategories.length > 0 && (
            <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100/80 dark:border-slate-800 px-8 py-4 text-sm flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[24px]">
              <span className="text-slate-500 dark:text-slate-400">Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{displayCategories.length}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredCategories.length}</span> categories</span>
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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {displayCategories.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900/50">
                <Layers className="h-8 w-8 opacity-80" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">No categories found</p>
              <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 text-sm">Add a new category to organize your menu.</p>
              <Button onClick={() => { reset(); setIsCreateModalOpen(true); }} className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <Plus className="h-4 w-4 mr-2" />
                Add First Category
              </Button>
            </div>
          ) : (
            displayCategories.map((category) => (
              <div key={category.id} className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg rounded-[20px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-5 relative group transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">Category</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-none">{category.name}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                    <Hash className="h-3 w-3 mr-1 text-slate-400" />
                    {category.id}
                  </span>
                </div>

                <div className="mb-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t("created_by")}</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                    <User className="h-3 w-3 mr-1.5 text-slate-400" />
                    {category.user}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100/80 dark:border-slate-800">
                  <button onClick={() => handleViewClick(category)} className="flex-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-slate-50 dark:bg-slate-800/50 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Eye className="h-4 w-4" /> {t("view")}
                  </button>
                  <button onClick={() => handleUpdateClick(category)} className="flex-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 bg-slate-50 dark:bg-slate-800/50 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Pencil className="h-4 w-4" /> {t("update")}
                  </button>
                  <button onClick={() => handleDeleteClick(category)} className="flex-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 bg-slate-50 dark:bg-slate-800/50 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Trash2 className="h-4 w-4" /> {t("delete")}
                  </button>
                </div>
              </div>
            ))
          )}
          {displayCategories.length > 0 && (
            <div className="flex flex-col items-center gap-3 pt-2 pb-4">
              <span className="text-xs text-slate-400 dark:text-slate-500">Showing {displayCategories.length} of {filteredCategories.length} categories</span>
              <div className="flex items-center gap-2">
                <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 rounded-lg shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-slate-600 dark:text-slate-400 text-sm font-medium px-2">Page {currentPage} of {pageCount || 1}</span>
                <Button onClick={() => setCurrentPage(p => (!pageCount || p >= pageCount ? p : p + 1))} disabled={!pageCount || currentPage >= pageCount} className="h-8 rounded-lg shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-2">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && selectedCategory && (
        <Modal category={selectedCategory} onClose={closeModal} />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal onConfirm={deleteCategory} onCancel={closeConfirmDelete} />
      )}
      {isUpdateModalOpen && (
        <UpdateModal onClose={() => setIsUpdateModalOpen(false)} onSubmit={handleUpdateSubmit} />
      )}
      {isCreateModalOpen && (
        <CreateCategoryModal onClose={() => { setIsCreateModalOpen(false); reset(); }} onSubmit={handleCreateCategory} />
      )}

      {
        isVisible && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-24 left-6 h-12 w-12 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border border-white/20 dark:border-black/20"
          >
            <ChevronUp className="h-6 w-6 group-hover:scale-125 transition-transform" />
          </button>
        )}

    </div>
  );
};

export default ManageCategory;
