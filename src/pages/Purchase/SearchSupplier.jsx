import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import Select from "react-select";
import { API_ENDPOINTS } from "@/utils/apiConfig";

const SearchSupplier = ({ onSupplierSelect }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.SUPPLIERS);
        setSuppliers(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const supplierOptions = [
    { value: "all", label: "All" },
    ...suppliers.map((supplier) => ({
      value: supplier.name,
      label: supplier.name,
    })),
  ];

  const handleChange = (selectedOption) => {
    onSupplierSelect(selectedOption);
  };

  return (
    <Select
      className="ml-4 w-[80%] md:w-64 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      options={supplierOptions}
      placeholder="Search suppliers..."
      onChange={handleChange}
    />
  );
};

export default SearchSupplier;
