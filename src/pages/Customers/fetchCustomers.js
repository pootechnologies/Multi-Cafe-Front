// src/hooks/useCustomers.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../../utils/apiConfig";

const fetchCustomers = async () => {
  const accessToken = localStorage.getItem("access_token");
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const response = await axios.get(
    `${API_BASE_URL}${API_ENDPOINTS.CUSTOMERS}`,
    { headers }
  );
  return response.data;
};

const updateCustomer = async ({ id, ...data }) => {
  const accessToken = localStorage.getItem("access_token");
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const response = await axios.put(
    `${API_BASE_URL}${API_ENDPOINTS.CUSTOMERS}/${id}`,
    data,
    { headers }
  );
  return response.data;
};

const deleteCustomer = async (id) => {
  const accessToken = localStorage.getItem("access_token");
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.CUSTOMERS}/${id}`, {
    headers,
  });
};

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
    },
  });
};
