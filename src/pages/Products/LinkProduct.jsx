import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { t } from "i18next";
import { useState, useEffect } from "react";
import Select from "react-select";

// ✅ Updated schema to support array of components
const supplierSchema = z.object({
  name: z.object(
    { value: z.number(), label: z.string() },
    { required_error: "Bundle product is required" }
  ),
  components: z
    .array(
      z.object({
        component: z.object(
          { value: z.number(), label: z.string() },
          { required_error: "Component product is required" }
        ),
        quantity: z.coerce
          .number({ invalid_type_error: "Quantity must be a number" })
          .min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one component is required"),
});

const LinkProduct = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: null,
      components: [{ component: null, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "components",
    control,
  });

  const [bundleProducts, setBundleProducts] = useState([]);
  const [componentProducts, setComponentProducts] = useState([]);

  // FETCH PRODUCTS WITH BUNDLE (is_bundle: true)
  useEffect(() => {
    const fetchBundleProducts = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.PRODUCT_BUNLDE);
        const productOptions = response.data.map((p) => ({
          value: p.id,
          label: p.specification ? `${p.name} - ${p.specification}` : p.name,
        }));
        setBundleProducts(productOptions);
      } catch (error) {
        console.error("Error fetching bundle products:", error);
      }
    };
    fetchBundleProducts();
  }, []);

  // FETCH PRODUCTS WITHOUT BUNDLE (is_bundle: false)
  useEffect(() => {
    const fetchComponentProducts = async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.PRODUCT_COMPONENT
        );
        const productOptions = response.data.map((p) => ({
          value: p.id,
          label: p.specification ? `${p.name} - ${p.specification}` : p.name,
        }));
        setComponentProducts(productOptions);
      } catch (error) {
        console.error("Error fetching component products:", error);
      }
    };
    fetchComponentProducts();
  }, []);

  const onSubmit = async (data) => {
    try {
      // ✅ Updated payload to match new API structure
      const payload = {
        bundle_id: data.name.value,
        components: data.components.map((comp) => ({
          component_id: comp.component.value,
          quantity: comp.quantity,
        })),
      };
      const response = await axiosInstance.post(
        API_ENDPOINTS.BUNDLE_COMPONENTS,
        payload
      );
      if (response.status === 500) {
        throw new Error("Failed to add bundle component");
      }
      toast.success("Components linked to bundle successfully!");
      reset({
        name: null,
        components: [{ component: null, quantity: 1 }],
      });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error);
    }
  };

  return (
    <div className="relative w-full md:max-w-xl container p-5 bg-white dark:bg-gray-800">
      {/* Modal Header */}
      <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("link_product")}
        </h3>
      </div>
      {/* Modal Body */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          {/* Bundle (name) */}
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Bundle
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={bundleProducts}
                  placeholder="Select product"
                  classNamePrefix="react-select"
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Components List */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Components
            </label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">
                  <Controller
                    name={`components.${index}.component`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={componentProducts}
                        placeholder="Select component"
                        classNamePrefix="react-select"
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                      />
                    )}
                  />
                  {errors.components?.[index]?.component && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.components[index].component.message}
                    </p>
                  )}
                </div>
                <div className="w-24">
                  {/* ✅ Added label for quantity */}
                  <label
                    htmlFor={`components.${index}.quantity`}
                    Quantity
                    className="block mb-1 text-xs font-medium text-gray-900 dark:text-white"
                  >
                    {t("quantity")}
                  </label>
                  <Controller
                    name={`components.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        min="1"
                        {...field}
                        className={`bg-gray-50 border ${
                          errors.components?.[index]?.quantity
                            ? "border-red-500"
                            : "border-gray-300"
                        } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                        placeholder="Qty"
                      />
                    )}
                  />
                  {errors.components?.[index]?.quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.components[index].quantity.message}
                    </p>
                  )}
                </div>
                <div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ component: null, quantity: 1 })}
              className="mt-2"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add More
            </Button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
            >
              <Plus className="mr-1" />
              {t("submit")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LinkProduct;
