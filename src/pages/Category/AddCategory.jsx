import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axiosInstance from "../../utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus } from "lucide-react";
import { t } from "i18next";

const AddCategory = () => {
  const categoryNameForm = useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    axiosInstance
      .get(API_ENDPOINTS.CATEGORIES)
      .then((response) => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the categories:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmitCategoryName = (data) => {
    axiosInstance
      .post(API_ENDPOINTS.CATEGORIES, {
        name: data.category_name,
      })
      .then((response) => {
        toast.success(response.data.message || "Category added successfully!");
        categoryNameForm.reset();
        fetchCategories();
      })
      .catch((error) => {
        console.error("There was an error adding the category:", error);
        toast.error(error.response?.data?.name || "Failed to add category");
      });
  };

  return (
    <div className="max-w-2xl  p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FolderPlus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {t("add_category")}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Create a new organizational category for your products.</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={categoryNameForm.handleSubmit(onSubmitCategoryName)} className="p-8 space-y-8">
          <div className="space-y-2">
            <label
              htmlFor="category_name"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
            >
              {t("category_name")}
            </label>
            <input
              id="category_name"
              {...categoryNameForm.register("category_name", {
                required: t("category_name_required") || "Category name is required",
              })}
              className={`w-full px-5 py-4 rounded-2xl border transition-all outline-none text-sm dark:bg-slate-800 dark:text-white
                ${categoryNameForm.formState.errors.category_name
                  ? "border-rose-500 ring-4 ring-rose-500/10"
                  : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                }`}
              placeholder={t("enter_category_name")}
              autoComplete="off"
            />
            {categoryNameForm.formState.errors.category_name && (
              <p className="text-rose-500 text-xs font-bold uppercase tracking-wider ml-1">
                {categoryNameForm.formState.errors.category_name.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="px-10 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-900/10 dark:shadow-none"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("add_category")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
