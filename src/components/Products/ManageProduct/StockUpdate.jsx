import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Select from "react-select";

const StockUpdate = () => {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const queryClient = useQueryClient();

  // Fetch products for dropdown
  const { data: products, isLoading } = useQuery({
    queryKey: ["products-for-stock-update"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.PRODUCTS}?include_all=True`
      );
      return response?.data?.results;
    },
    onError: () => toast.error("Failed to load products"),
  });

  // When product changes, update currentStock + clear input
  useEffect(() => {
    if (selectedProductId && products) {
      const product = products.find((p) => p.id === selectedProductId.value);
      if (product) {
        setCurrentStock(product.stock);
        setNewStock(""); // input stays empty
      }
    }
  }, [selectedProductId, products]);

  const handleUpdateStock = async () => {
    if (!selectedProductId || newStock === "") {
      toast.error("Please enter a valid stock value");
      return;
    }
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.PRODUCTS}${selectedProductId.value}/`,
        { stock: Number(newStock) }, // send only the typed number
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["products-for-stock-update"],
      });
      toast.success("Stock updated successfully!");
    } catch (error) {
      toast.error("Failed to update stock");
    }
  };

  const productOptions = products
    ? products.map((product) => ({
      value: product.id,
      label: `${product.name}`,
    }))
    : [];

  return (
    <div className="max-w-md m-4 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Update Product Stock</h2>

      <div className="mb-4">
        <label className="block mb-2">Select Product</label>
        <Select
          isClearable
          value={selectedProductId}
          onChange={setSelectedProductId}
          options={productOptions}
          placeholder="Select a product"
          isLoading={isLoading}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {selectedProductId && (
        <div className="mb-4 space-y-2">
          <label className="block mb-2">
            Stock (Current: {currentStock})
          </label>
          <input
            type="number"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            className="w-full p-2 border rounded"
            min="0"
            placeholder="Enter new stock"
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleUpdateStock}
          className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
          disabled={!selectedProductId || newStock === ""}
        >
          Update Stock
        </Button>
      </div>
    </div>
  );
};

export default StockUpdate;
