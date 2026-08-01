import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL_LOGIN, API_ENDPOINTS } from "../../utils/apiConfig";
import { useForm } from "react-hook-form";
import axios from "axios";
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
import {
  Eye,
  Pencil,
  Trash2,
  Tags,
  AlertTriangle,
  X,
  Hash,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ManageBusinessCategory = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedCards, setExpandedCards] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL_LOGIN}${API_ENDPOINTS.TENANT_BUSINESS_CATEGORIES}`
      );
      const data = response.data.results || [];
      const sortedCategories = [...data].sort((a, b) => b.id - a.id);
      setCategories(sortedCategories);
      setFilteredCategories(sortedCategories);
    } catch (error) {
      console.error("There was an error fetching the data:", error);
    } finally {
      setIsLoading(false);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    if (!categoryToDelete) return Promise.resolve();
    return axios
      .delete(
        `${API_BASE_URL_LOGIN}${API_ENDPOINTS.TENANT_BUSINESS_CATEGORIES}/${categoryToDelete.id}`
      )
      .then(() => {
        setCategories(
          categories.filter((category) => category.id !== categoryToDelete.id)
        );
        setFilteredCategories(
          filteredCategories.filter(
            (category) => category.id !== categoryToDelete.id
          )
        );
        toast.success("Business category deleted successfully!");
        closeConfirmDelete();
      })
      .catch((error) => {
        console.error("There was an error deleting the category:", error);
        toast.error(
          error.response?.data?.detail || "Failed to delete business category!"
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
      toast.error("Business category name is required!");
      return;
    }
    try {
      await axios.patch(
        `${API_BASE_URL_LOGIN}${API_ENDPOINTS.TENANT_BUSINESS_CATEGORIES}/${selectedCategory.id}`,
        {
          name: data.name,
        }
      );
      fetchCategories();
      toast.success("Business category name updated successfully!");
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("There was an error updating the category name:", error);
      toast.error(
        error.response?.data?.detail || "Failed to update business category!"
      );
    }
  };

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const displayCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name) => {
    if (!name) return "MA";
    return name.substring(0, 2).toUpperCase();
  };

  const Modal = ({ category, onClose }) => {
    if (!category) return null;
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
                Business Category Details
              </h2>
            </div>

            <div className="space-y-3">
              <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                  <Hash className="w-3 h-3" /> ID
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">#{category.id}</p>
              </div>

              <div className="border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                  <Tags className="w-3 h-3" /> Category Name
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</p>
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
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-full">
                <AlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
              Delete Business Category
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
              Are you sure you want to delete this business category? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 rounded-xl border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UpdateModal = ({ onClose, onSubmit }) => {
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
                <Pencil className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Update Business Category
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1 block mb-2">
                  Category Name
                </label>
                <div className="relative group">
                   <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
                  <input
                    type="text"
                    {...register("name", { required: true })}
                    className="w-full pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500/20 rounded-xl transition-all outline-none"
                    placeholder="Enter category name"
                    autoComplete="off"
                  />
                </div>
                {errors.name && (
                  <p className="text-rose-500 text-xs mt-1">Category name is required</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-xl border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white"
                >
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
     <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
       {isVisible && (
         <button
           onClick={scrollToTop}
           className="fixed bottom-6 left-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all z-20"
         >
           <ChevronRight className="h-6 w-6 rotate-[-90deg]" />
         </button>
       )}

       <div className="bg-white rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
         <div className="bg-gradient-to-r from-slate-900/10 via-slate-800/5 to-transparent px-6 py-6 border-b border-slate-200/60 dark:border-slate-800">
           <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
             <div className="p-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl shadow-lg shadow-slate-900/20">
               <Tags className="h-6 w-6" />
             </div>
             Manage Business Categories
           </h2>
         </div>

        <div className="p-4 sm:p-6 space-y-6">

          {/* Desktop Table View */}
          <div className="hidden md:block border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50/80">
                <TableRow className="border-b-slate-200/60 dark:border-b-slate-800">
                  <TableHead className="w-[100px] font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap"># ID</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Tags className="w-4 h-4 text-slate-400" />
                      Category Name
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayCategories.length > 0 ? (
                  displayCategories.map((category) => (
                    <TableRow key={category.id} className="border-b-slate-200/60 dark:border-b-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="font-medium text-slate-500 dark:text-slate-400">#{category.id}</TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</TableCell>
                       <TableCell className="text-right">
                         <div className="flex justify-end gap-2">
                           <button onClick={() => handleViewClick(category)} className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm transition-all flex items-center justify-center" title="View">
                             <Eye className="h-4 w-4" />
                           </button>
                           <button onClick={() => handleUpdateClick(category)} className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 shadow-sm transition-all flex items-center justify-center" title="Update">
                             <Pencil className="h-4 w-4" />
                           </button>
                           <button onClick={() => handleDeleteClick(category)} className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 shadow-sm transition-all flex items-center justify-center" title="Delete">
                             <Trash2 className="h-4 w-4" />
                           </button>
                         </div>
                       </TableCell>
                    </TableRow>
                  ))
                ) : isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Spinner className="size-6" />
                        <span className="text-sm font-medium text-slate-400">Loading categories...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-slate-500 dark:text-slate-400 font-medium">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {displayCategories.length > 0 ? (
              displayCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="inline-flex items-center px-2 py-0.5 bg-slate-100/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold rounded-md mb-3">
                          #{category.id}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          Category Name
                        </p>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                          {category.name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleViewClick(category)} className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center transition-colors" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleUpdateClick(category)} className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center justify-center transition-colors" title="Update">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(category)} className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                </div>
              ))
            ) : isLoading ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-200 dark:border-slate-700 text-center shadow-sm flex flex-col items-center gap-3">
                <Spinner className="size-7 text-slate-900 dark:text-slate-100" />
                <span className="text-sm font-medium text-slate-400">Loading categories...</span>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400 font-medium shadow-sm">
                No categories found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
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
                        if (pageNum > totalPages)
                          pageNum = totalPages - (4 - i);
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

      {isModalOpen && selectedCategory && (
        <Modal category={selectedCategory} onClose={closeModal} />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal
          onConfirm={deleteCategory}
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

export default ManageBusinessCategory;
