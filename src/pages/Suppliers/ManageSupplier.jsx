import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DataGrid } from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import { t } from "i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance"; // Import your axiosInstance

// Zod validation schema for supplier update
const supplierUpdateSchema = z.object({
  name: z.string().min(1, t("enter_supplier_name")),
  contact_info: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{10}$/.test(value), {
      message: t("contact_info_must_ten"),
    }),
  tin_number: z.string().optional(),
});

const ManageSupplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedCards, setExpandedCards] = useState({});

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierUpdateSchema),
  });

  // Fetch suppliers from the API
  const fetchSuppliers = async () => {
    try {
      const response = await axiosInstance.get("/suppliers"); // Use axiosInstance
      const sortedSuppliers = response.data?.results.sort((a, b) => b.id - a.id); // Sort by 'id' in descending order
      setSuppliers(sortedSuppliers);
      setFilteredSuppliers(sortedSuppliers); // Set the initial list of suppliers
    } catch (error) {
      console.error("There was an error fetching the suppliers:", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
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

  // Update filtered suppliers based on the search term
  useEffect(() => {
    if (searchTerm) {
      setFilteredSuppliers(
        suppliers.filter((supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [searchTerm, suppliers]);

  // Update formData when selectedSupplier changes
  useEffect(() => {
    if (selectedSupplier) {
      setValue("name", selectedSupplier.name);
      setValue("contact_info", selectedSupplier.contact_info);
      setValue("tin_number", selectedSupplier.tin_number);
    }
  }, [selectedSupplier, setValue]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewClick = (supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const deleteSupplier = () => {
    if (!supplierToDelete) return;
    axiosInstance
      .delete(`/suppliers/${supplierToDelete.id}/`) // Use axiosInstance
      .then(() => {
        setSuppliers(
          suppliers.filter((supplier) => supplier.id !== supplierToDelete.id)
        );
        setFilteredSuppliers(
          filteredSuppliers.filter(
            (supplier) => supplier.id !== supplierToDelete.id
          )
        );
        toast.success("Supplier deleted successfully!");
        closeConfirmDelete();
      })
      .catch((error) => {
        console.error("There was an error deleting the supplier:", error);
        toast.error("Failed to delete supplier!");
        closeConfirmDelete();
      });
  };

  const handleUpdateClick = (supplier) => {
    setSelectedSupplier(supplier);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (data) => {
    try {
      const response = await axiosInstance.patch( // Use axiosInstance
        `/suppliers/${selectedSupplier.id}/`,
        data
      );
      const updatedSupplier = response.data;
      setSuppliers(
        suppliers.map((supplier) =>
          supplier.id === updatedSupplier.id ? updatedSupplier : supplier
        )
      );
      setFilteredSuppliers(
        filteredSuppliers.map((supplier) =>
          supplier.id === updatedSupplier.id ? updatedSupplier : supplier
        )
      );
      toast.success("Supplier updated successfully!");
      setIsUpdateModalOpen(false); // Close the modal after successful update
      fetchSuppliers(); // Refetch suppliers after update
    } catch (error) {
      console.error("There was an error updating the supplier:", error);
      toast.error("Failed to update supplier!");
    }
  };

  const Modal = ({ supplier, onClose }) => {
    if (!supplier) return null;
    return (
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            width: "400px",
            position: "relative",
          }}
        >
          <h2 className="mb-4 font-bold text-xl border-b p-1">
            {t("supplier_details")}
          </h2>
          <p className="m-2">
            <strong>{t("name")}:</strong> {supplier.name}
          </p>
          <p className="m-2">
            <strong>{t("contact_info")}:</strong> {supplier.contact_info}
          </p>
          <p className="m-2">
            <strong>{t("supplier_tin")}:</strong> {supplier.tin_number}
          </p>
          <div className="flex justify-end">
            <Button
              className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          width: "400px",
        }}
      >
        <h2 className="mb-4 font-bold text-2xl border-b p-1">
          {t("are_you_sure")}
        </h2>
        <p>{t("sure_discription_supplier")}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md"
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

  const UpdateModal = ({ onClose, onSubmit }) => {
    return (
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            width: "400px",
            position: "relative",
          }}
        >
          <h2 className="mb-4 font-bold text-xl border-b p-1">
            {t("update_supplier")}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block mb-2">{t("name")}</label>
              <input
                type="text"
                name="name"
                {...register("name")}
                className={`w-full border rounded p-2 ${
                  errors.name ? "border-red-500" : ""
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t("contact_info")}</label>
              <input
                type="text"
                name="contact_info"
                {...register("contact_info")}
                className={`w-full border rounded p-2 ${
                  errors.contact_info ? "border-red-500" : ""
                }`}
              />
              {errors.contact_info && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contact_info.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t("tin_number")}</label>
              <input
                type="text"
                name="tin_number"
                {...register("tin_number")}
                className={`w-full border rounded p-2 ${
                  errors.tin_number ? "border-red-500" : ""
                }`}
              />
              {errors.tin_number && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tin_number.message}
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <Button
                type="submit"
                className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
              >
                {t("update")}
              </Button>
              <Button
                onClick={onClose}
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              >
                {t("cancel")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Pagination
  const pageCount = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const displaySuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Define columns for DataGrid
  const columns = [
    { field: "id", headerName: t("id"), width: 100 },
    { field: "name", headerName: t("supplier_name"), width: 200 },
    { field: "contact_info", headerName: t("contact_info"), width: 200 },
    { field: "tin_number", headerName: t("tin_number"), width: 200 },
    { field: "user", headerName: t("created_by"), width: 200 },
    {
      field: "actions",
      headerName: t("actions"),
      width: 300,
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
            <DropdownMenuItem onClick={() => handleUpdateClick(params.row)}>
              <Pencil className="mr-2 h-4 w-4 text-yellow-500" />
              {t("update")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(params.row)}>
              <Trash2 className="mr-2 h-4 w-4 text-red-600" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Prepare rows for DataGrid
  const rows = displaySuppliers.map((supplier, index) => ({
    id: supplier.id,
    name: supplier.name,
    contact_info: supplier.contact_info,
    tin_number: supplier.tin_number,
    user: supplier.user,
    actions: supplier,
  }));

  return (
    <>
      <div className="container p-5">
        <div className="text-right mb-4">
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
              }}
            >
              ↑
            </button>
          )}
        </div>
        <h3 className="lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-5 sm:text-sm border-b">
          {t("manage_suppliers")}
        </h3>
        {/* Search Box */}
        <div className="mb-4">
          <input
            type="search"
            placeholder={t("search_suppliers...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
        {/* Desktop View */}
        <div style={{ height: "auto", width: "100%" }} className="hidden md:block">
          <DataGrid
            sx={{
              "& .MuiDataGrid-footerContainer": { display: "none" },
            }}
            rows={rows}
            columns={columns}
            disableSelectionOnClick
            pageSize={itemsPerPage}
            rowCount={filteredSuppliers.length}
            paginationMode="server"
          />
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-3">
          {displaySuppliers?.map((supplier) => (
            <div key={supplier.id} className={`bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all ${Object.values(expandedCards).some(v => v) && !expandedCards[supplier.id] ? 'opacity-40 blur-sm' : ''}`}>
              <div className="flex justify-between items-start mb-3 pb-3 border-b">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">#{supplier.id}</h3>
                  <p className="text-base text-gray-600 mt-1">{supplier.name}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleViewClick(supplier)}>
                      <Eye className="mr-2 h-4 w-4" />{t("view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateClick(supplier)}>
                      <Pencil className="mr-2 h-4 w-4" />{t("update")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(supplier)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />{t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("contact_info")}</span>
                  <span className="font-medium text-gray-900">{supplier.contact_info || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                  <span className="text-gray-700 font-medium">{t("created_by")}</span>
                  <span className="font-bold text-gray-900">{supplier.user}</span>
                </div>
              </div>
              
              <button
                onClick={() => setExpandedCards(prev => {
                  const isCurrentlyExpanded = prev[supplier.id];
                  return isCurrentlyExpanded ? {} : { [supplier.id]: true };
                })}
                className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {expandedCards[supplier.id] ? (
                  <>
                    <span>Hide Details</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Show Details</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
              
              {expandedCards[supplier.id] && (
                <div className="mt-3 pt-3 border-t space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("tin_number")}</span>
                    <span className="font-medium text-gray-900">{supplier.tin_number || "N/A"}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {isModalOpen && selectedSupplier && (
          <Modal supplier={selectedSupplier} onClose={closeModal} />
        )}
        {isConfirmDeleteOpen && (
          <ConfirmDeleteModal
            onConfirm={deleteSupplier}
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
      <Pagination
        count={pageCount}
        color="primary"
        page={currentPage}
        onChange={handlePageChange}
        className="mt-4 flex justify-center"
      />
    </>
  );
};

export default ManageSupplier;
