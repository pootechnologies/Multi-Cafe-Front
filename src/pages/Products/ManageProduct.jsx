import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { useForm } from "react-hook-form";
import axiosInstance from "@/utils/axiosInstance"; // <-- Import your instance
import ProductTable from "@/components/Products/ManageProduct/ProductTable";
import Modal from "@/components/Products/ManageProduct/Modal";
import ConfirmDeleteModal from "@/components/Products/ManageProduct/ConfirmDeleteModal";
import UpdateModal from "@/components/Products/ManageProduct/UpdateModal";
import ImageModal from "@/components/Products/ManageProduct/ImageModal";
import { Pagination } from "@mui/material";
import { getImageUrl } from "@/utils/imageHelper";

const PAGE_SIZE = 10;

const ManageProduct = () => {
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { register, handleSubmit, setValue, reset } = useForm();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page, searchTerm],
    queryFn: async () => {
      let url = `${API_ENDPOINTS.PRODUCTS}?page=${page}`;
      if (searchTerm) {
        url = `${API_ENDPOINTS.PRODUCTS}?search=${searchTerm}&include_all=True`;
      }
      const response = await axiosInstance.get(url);
      return response?.data;
    },
    onError: () => toast.error("Failed to load products"),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
      return response?.data;
    },
  });

  const handlePageChange = (event, value) => setPage(value);
  const totalPages = searchTerm
    ? (data?.results?.length || data?.all_results?.length ? 1 : 0)
    : (data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0);

  const handleViewClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await axiosInstance.delete(
        `${API_ENDPOINTS.PRODUCTS}${productToDelete.id}/`
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully!");
      closeConfirmDelete();
    } catch (error) {
      toast.error("Failed to delete product!");
      closeConfirmDelete();
    }
  };

  const handleUpdateClick = (product) => {
    setSelectedProduct(product);
    setValue("name", product.name);
    setValue("specification", product.specification);
    setValue("description", product.description);
    setValue("buyingPrice", product.buying_price);
    setValue("sellingPrice", product.selling_price);
    setValue("receipt_no", product.receipt_no);
    setValue("stock", product.stock);
    setValue("unit", product.unit);
    setValue("piece", product.piece);
    setValue("package", product.package);
    setValue("category", product.category); // <-- Changed to "category"
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (data) => {
    const formData = new FormData();
    if (data.name !== selectedProduct.name) {
      formData.append("name", data.name);
    }
    if (data.description !== selectedProduct.description) {
      formData.append("description", data.description);
    }
    if (data.receipt_no !== selectedProduct.receipt_no) {
      formData.append("receipt_no", data.receipt_no);
    }
    if (data.buyingPrice !== selectedProduct.buying_price) {
      formData.append("buying_price", data.buyingPrice);
    }
    if (data.sellingPrice !== selectedProduct.selling_price) {
      formData.append("selling_price", data.sellingPrice);
    }
    if (data.stock !== selectedProduct.stock) {
      formData.append("stock", data.stock);
    }
    if (data.unit !== selectedProduct.unit) {
      formData.append("unit", data.unit);
    }
    if (data.piece !== selectedProduct.piece) {
      formData.append("piece", data.piece);
    }
    if (data.package !== selectedProduct.package) {
      formData.append("package", data.package);
    }
    // Only append category if it is not empty
    if (data.category) {
      formData.append("category", data.category);
    }
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.PRODUCTS}${selectedProduct.id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully!");
      setIsUpdateModalOpen(false);
    } catch (error) {
      toast.error("Failed to update product!");
    }
  };



  const handleImageClick = (imageUrl) => {
    if (imageUrl) {
      setSelectedImage(getImageUrl(imageUrl));
      setIsImageModalOpen(true);
    }
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1);
  };

  const getReceiptStatus = (receipt) => {
    return receipt ? "yes" : "no";
  };

  return (
    <div className="px-5 mt-10 md:mt-0 min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-background md:p-8 lg:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full mx-auto space-y-8">
        <ProductTable
          products={data?.results || data?.all_results || []}
          categories={categories || []}
          onViewClick={handleViewClick}
          onUpdateClick={handleUpdateClick}
          onDeleteClick={handleDeleteClick}
          onImageClick={handleImageClick}
          onSearch={handleSearch}
          searchTerm={searchTerm}
          isLoadingProducts={isLoading}
          getReceiptStatus={getReceiptStatus}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      {isModalOpen && <Modal product={selectedProduct} onClose={closeModal} />}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal
          onConfirm={deleteProduct}
          onCancel={closeConfirmDelete}
        />
      )}
      {isUpdateModalOpen && (
        <UpdateModal
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={handleUpdateSubmit}
          selectedProduct={selectedProduct}
          register={register}
          handleSubmit={handleSubmit}
          handleFileChange={handleFileChange}
          fileName={fileName}
          setValue={setValue}
        />
      )}
      {isImageModalOpen && (
        <ImageModal imageUrl={selectedImage} onClose={closeImageModal} />
      )}
    </div>
  );
};

export default ManageProduct;
