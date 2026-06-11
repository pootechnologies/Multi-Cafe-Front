// src/utils/axiosInstance.js
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS, API_BASE_URL_LOGIN } from "./apiConfig";
import { getBaseURL } from "./urlHelper";
import toast from "react-hot-toast";


const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Add auth token and cache-busting for GET requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Update base URL dynamically on each request
    config.baseURL = getBaseURL();
    
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Cache-busting for GET requests
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _: new Date().getTime(),
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401, token refresh, and errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // If 401 and not a retry, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          // No refresh token, redirect to login
          // toast.error("Session expired. Please login again.");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_info");
          localStorage.removeItem("schema_name");
          // window.location.href = "/login";
          return Promise.reject(error);
        }
        const response = await axios.post(
          `${API_BASE_URL_LOGIN}${API_ENDPOINTS.REFRESH}`,
          { refresh: refreshToken }
        );
        const { access } = response.data;
        localStorage.setItem("access_token", access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_info");
        localStorage.removeItem("schema_name");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    // For other errors, just pass them through
    return Promise.reject(error);
  }
);

export default axiosInstance;
