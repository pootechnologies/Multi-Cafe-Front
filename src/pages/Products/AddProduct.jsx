import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Select from "react-select";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Plus, X, Upload } from "lucide-react";
import AddCategoryModal from "./AddCategoryModal";
import AddSupplierModal from "./AddSupplierModal";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
        setCategories(
          response?.data?.results?.map((category) => ({
            id: category.id,
            label: category.name,
          })) || []
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    const fetchSuppliers = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.SUPPLIERS);
        setSuppliers(
          response?.data?.results?.map((supplier) => ({
            id: supplier.id,
            label: supplier.name,
          })) || []
        );
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchCategories();
    fetchSuppliers();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
  } = useForm();

  const validateForm = (data) => {
    const validationErrors = {};
    if (!data.name) {
      validationErrors.name = {
        type: "required",
        message: t("product_name_required"),
      };
    }
    if (!data.selling_price || data.selling_price <= 0) {
      validationErrors.selling_price = {
        type: "min",
        message: t("selling_price_must_greater_than_zero"),
      };
    }
    return validationErrors;
  };

  const onSubmit = async (data) => {
    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) {
      Object.keys(validationErrors).forEach((key) => {
        setError(key, validationErrors[key]);
      });
      return;
    }
    clearErrors();
    setIsSubmitting(true);
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (selectedCategory?.id) formData.append("category", selectedCategory.id);
    if (data.buying_price && data.buying_price > 0) {
      formData.append("buying_price", data.buying_price);
    }
    if (data.selling_price) formData.append("selling_price", data.selling_price);
    if (data.specification) formData.append("specification", data.specification);
    if (selectedSupplier?.id) formData.append("supplier", selectedSupplier.id);
    if (data.stock) formData.append("stock", data.stock);
    if (data.image && data.image[0]) formData.append("image", data.image[0]);
    if (data.description) formData.append("description", data.description);

    try {
      await axiosInstance.post(API_ENDPOINTS.PRODUCTS, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      reset();
      setSelectedCategory(null);
      setSelectedSupplier(null);
      setImagePreview(null);
      toast.success("Product added successfully!");
    } catch (error) {
      console.error("There was an error adding the product:", error);
      toast.error(error.response?.data?.error || "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("image", e.target.files);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {t("add_products")}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Create a new product for your catalog.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Product Name */}
            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("product_name")}
              </label>
              <input
                id="name"
                {...register("name")}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm dark:bg-slate-800 dark:text-white
                  ${errors.name ? "border-red-500 ring-2 ring-red-500/10" : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"}
                `}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("category")}</label>
                <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Plus className="size-3" /> {t("new")}
                </button>
              </div>
              <Select
                isClearable
                options={categories}
                value={selectedCategory}
                onChange={(opt) => { setValue("category", opt?.id); setSelectedCategory(opt); }}
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

            {/* Specification */}
            <div className="space-y-1.5">
              <label htmlFor="specification" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("specification")}
              </label>
              <input
                id="specification"
                {...register("specification")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all outline-none text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="e.g. Size, Color, etc."
              />
            </div>

            {/* Buying Price */}
            <div className="space-y-1.5">
              <label htmlFor="buying_price" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("buying_price")}
              </label>
              <input
                id="buying_price"
                type="number"
                {...register("buying_price", { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all outline-none text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Selling Price */}
            <div className="space-y-1.5">
              <label htmlFor="selling_price" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("selling_price")}
              </label>
              <input
                id="selling_price"
                type="number"
                {...register("selling_price", { valueAsNumber: true })}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm dark:bg-slate-800 dark:text-white
                  ${errors.selling_price ? "border-red-500 ring-2 ring-red-500/10" : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"}
                `}
              />
              {errors.selling_price && <p className="text-xs text-red-500 font-medium">{errors.selling_price.message}</p>}
            </div>

            {/* Stock */}
            <div className="space-y-1.5">
              <label htmlFor="stock" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("stock")}
              </label>
              <input
                id="stock"
                type="number"
                {...register("stock", { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all outline-none text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Supplier */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("supplier")}</label>
                <button type="button" onClick={() => setIsSupplierModalOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Plus className="size-3" /> {t("new")}
                </button>
              </div>
              <Select
                isClearable
                options={suppliers}
                value={selectedSupplier}
                onChange={(opt) => { setValue("supplier", opt?.id); setSelectedSupplier(opt); }}
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

            {/* Image Upload & Description */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="space-y-1.5 shrink-0">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("product_image")}</label>
                  <div className="relative group w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setImagePreview(null); setValue("image", null); }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <X className="size-6" />
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer p-4 text-center">
                        <Upload className="size-6 mx-auto text-slate-400" />
                        <span className="text-[10px] text-slate-500 mt-1 block font-medium">Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("description")}</label>
                  <textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all outline-none text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
                    placeholder="Enter product description..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); setSelectedCategory(null); setSelectedSupplier(null); setImagePreview(null); }}
              className="px-6 rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-900/10 dark:shadow-none"
            >
              {isSubmitting ? t("submitting") + "..." : t("submit_product")}
            </Button>
          </div>
        </form>
      </div>

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryAdded={async () => {
          const resp = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
          setCategories(resp.data.results.map(c => ({ id: c.id, label: c.name })));
        }}
      />
      <AddSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSupplierAdded={async () => {
          const resp = await axiosInstance.get(API_ENDPOINTS.SUPPLIERS);
          setSuppliers(resp.data.results.map(s => ({ id: s.id, label: s.name })));
        }}
      />
    </div>
  );
};

export default AddProduct;
