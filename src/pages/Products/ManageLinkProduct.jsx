import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { DataGrid } from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { t } from "i18next";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import toast from "react-hot-toast";
import Select from "react-select";

const ManageLinkedProduct = () => {
  const [bundles, setBundles] = useState([]);
  const [filteredBundles, setFilteredBundles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [bundleToUpdate, setBundleToUpdate] = useState(null);
  const [bundleProducts, setBundleProducts] = useState([]);
  const [componentProducts, setComponentProducts] = useState([]);
  const [uniqueBundles, setUniqueBundles] = useState([]);
  const itemsPerPage = 10;

  // Fetch bundles
  const fetchBundles = async (searchQuery = null) => {
    try {
      let url = `${API_ENDPOINTS.BUNDLE_COMPONENTS}?include_all=True`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(`"${searchQuery}"`)}`;
      }
      const response = await axiosInstance.get(url);
      setBundles(response?.data?.all_results || []);
      setFilteredBundles(response?.data?.all_results || []);
    } catch (error) {
      console.error("Error fetching bundles:", error);
      toast.error("Failed to fetch bundles");
    }
  };

  useEffect(() => {
    fetchBundles();
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  useEffect(() => {
    if (bundles.length > 0) {
      const uniqueOptions = Array.from(
        new Map(
          bundles.map((bundle) => [
            bundle.bundle_id,
            {
              value: bundle.bundle_id,
              label: `${bundle.bundle_name} - ${bundle.bundle_specification}`,
            },
          ])
        ).values()
      );
      setUniqueBundles([{ value: null, label: "All" }, ...uniqueOptions]);
    }
  }, [bundles]);

  const handleBundleSelect = (selectedOption) => {
    if (!selectedOption || selectedOption.value === null) {
      fetchBundles();
      return;
    }
    const productName = selectedOption.label.split(" - ")[0];
    fetchBundles(productName);
    setCurrentPage(1);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleViewClick = (bundle) => {
    setSelectedBundle(bundle);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (bundle) => {
    setBundleToUpdate(bundle);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (bundle) => {
    setComponentToDelete(bundle);
    setIsConfirmDeleteOpen(true);
  };

  const deleteComponent = async () => {
    if (!componentToDelete) return;
    try {
      await axiosInstance.delete(
        `${API_ENDPOINTS.BUNDLE_COMPONENTS}${componentToDelete.id}/`
      );
      fetchBundles();
      toast.success("Component deleted successfully!");
      setIsConfirmDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting component:", error);
      toast.error("Failed to delete component");
    }
  };

  const pageCount = Math.ceil(filteredBundles.length / itemsPerPage);
  const displayBundles = filteredBundles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (event, pageNumber) => setCurrentPage(pageNumber);

  const columns = [
    {
      field: "id",
      headerName: t("id"),
      width: 80,
    },
    {
      field: "bundle_name",
      headerName: "Bundle Name",
      width: 200,
    },
    {
      field: "bundle_specification",
      headerName: t("specification"),
      width: 200,
    },
    {
      field: "actions",
      headerName: t("actions"),
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleViewClick(params.row);
              }}
              className="text-blue-600"
            >
              <Eye className="mr-2 h-4 w-4 text-blue-600" />
              {t("view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateClick(params.row);
              }}
              className="text-yellow-600"
            >
              <Pencil className="mr-2 h-4 w-4 text-yellow-600" />
              {t("update")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(params.row);
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4 text-red-600" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const rows = displayBundles.map((bundle) => ({
    id: bundle.id,
    bundle_name: bundle.bundle_name,
    bundle_specification: bundle.bundle_specification,
    components: bundle.components,
  }));

  // --- MODALS ---
  const Modal = ({ bundle, onClose }) => {
    if (!bundle) return null;
    return (
      <div
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
        onClick={onClose}
      >
        <div
          className="bg-white p-5 rounded-lg w-full max-w-md relative"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-4 font-bold text-xl border-b p-1">
            Bundle Details
          </h2>
          <p className="m-2">
            <strong>Bundle Name</strong> {bundle.bundle_name}
          </p>
          <p className="m-2">
            <strong>{t("specification")}:</strong> {bundle.bundle_specification}
          </p>
          <p className="m-2">
            <strong>Components:</strong>
            <ul className="list-disc pl-5">
              {bundle.components.map((comp) => (
                <li key={comp.id}>
                  {comp.component_name}{" "}
                  {comp.component_specification &&
                    `(${comp.component_specification})`}{" "}
                  - Qty: {comp.quantity}
                </li>
              ))}
            </ul>
          </p>
          <div className="flex justify-end">
            <Button
              className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              onClick={onClose}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
      onClick={onCancel}
    >
      <div
        className="bg-white p-5 rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 font-bold text-2xl border-b p-1">
          {t("are_you_sure")}
        </h2>
        <p>{t("sure_discription_bundle")}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            onClick={onConfirm}
            className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
          >
            {t("delete")}
          </Button>
          <Button
            onClick={onCancel}
            className="bg-[#913030] hover:bg-[#b35a5a] text-white px-4 py-2 rounded-md"
          >
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  );

  const UpdateBundleModal = ({ bundle, onClose, onSuccess }) => {
    const { control, handleSubmit, setValue, watch } = useForm({
      defaultValues: {
        components: bundle.components.map((comp) => ({
          id: comp.id,
          component: {
            value: comp.component_id,
            label: `${comp.component_name}${
              comp.component_specification ? ` (${comp.component_specification})` : ""
            }`,
          },
          quantity: comp.quantity,
        })),
      },
    });

    const components = watch("components");

    const handleComponentChange = (index, value) => {
      const updated = [...components];
      updated[index].component = value;
      setValue("components", updated);
    };

    const handleQuantityChange = (index, value) => {
      const updated = [...components];
      updated[index].quantity = value;
      setValue("components", updated);
    };

    const addComponent = () => {
      const updated = [
        ...components,
        { component: null, quantity: 1 },
      ];
      setValue("components", updated);
    };

    const removeComponent = (index) => {
      const updated = [...components];
      updated.splice(index, 1);
      setValue("components", updated);
    };

    const onSubmit = async (formData) => {
      try {
        const payload = {
          bundle_id: bundle.bundle_id,
          components: formData.components.map((comp) => ({
            id: comp.id,
            component_id: comp.component.value,
            quantity: comp.quantity,
          })),
        };
        const response = await axiosInstance.patch(
          `${API_ENDPOINTS.BUNDLE_COMPONENTS}${bundle.id}/`,
          payload
        );
        if (response.status === 200) {
          toast.success("Bundle updated successfully!");
          onSuccess();
          onClose();
        } else {
          throw new Error("Failed to update bundle");
        }
      } catch (error) {
        console.error(error);
        toast.error(error?.response?.data?.components?.error);
      }
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-4"
        onClick={onClose}
      >
        <div
          className="bg-white p-5 rounded-lg w-full max-w-md relative"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-4 font-bold text-xl border-b p-1">Update Bundle</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Bundle
                </label>
                <Select
                  value={{
                    value: bundle.bundle_id,
                    label: `${bundle.bundle_name} - ${bundle.bundle_specification}`,
                  }}
                  options={bundleProducts}
                  isDisabled
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Components
                </label>
                {components.map((comp, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-end">
                    <div className="flex-1">
                      <Select
                        value={comp.component}
                        options={componentProducts}
                        onChange={(val) => handleComponentChange(index, val)}
                      />
                    </div>
                    <div className="w-24">
                      <label className="block mb-1 text-xs font-medium text-gray-900 dark:text-white">
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
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value, 10));
                              handleQuantityChange(index, parseInt(e.target.value, 10));
                            }}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2"
                          />
                        )}
                      />
                    </div>
                    <div>
                      {components.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeComponent(index)}
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
                  onClick={addComponent}
                  className="mt-2"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  {t("add_more")}
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
                >
                  {t("update")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="container p-4">
        {isVisible && (
          <button
            onClick={scrollToTop}
            style={{
              position: "fixed",
              bottom: "20px",
              left: "20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              cursor: "pointer",
              zIndex: 20,
            }}
          >
            ↑
          </button>
        )}
        <h3 className="lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-5 sm:text-sm border-b">
          {t("manage_linked_product")}
        </h3>
        <div className="w-full md:w-1/4 mb-4 mt-4">
          <Select
            options={uniqueBundles}
            onChange={handleBundleSelect}
            isClearable
            placeholder="Filter by bundle..."
          />
        </div>
        <div style={{ height: "auto", width: "100%" }}>
          <DataGrid
            sx={{
              "& .MuiDataGrid-footerContainer": { display: "none" },
              "& .MuiDataGrid-scrollbar--horizontal": {
                display: "scroll",
                zIndex: 0,
              },
            }}
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            pageSize={itemsPerPage}
            sortModel={[{ field: "id", sort: "desc" }]}
          />
        </div>
        {isModalOpen && selectedBundle && (
          <Modal
            bundle={selectedBundle}
            onClose={() => setIsModalOpen(false)}
          />
        )}
        {isConfirmDeleteOpen && (
          <ConfirmDeleteModal
            onConfirm={deleteComponent}
            onCancel={() => setIsConfirmDeleteOpen(false)}
          />
        )}
        {isUpdateModalOpen && bundleToUpdate && (
          <UpdateBundleModal
            bundle={bundleToUpdate}
            onClose={() => setIsUpdateModalOpen(false)}
            onSuccess={fetchBundles}
          />
        )}
      </div>
      <div className="mb-4">
        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          className="mt-4 flex justify-center"
        />
      </div>
    </>
  );
};

export default ManageLinkedProduct;
