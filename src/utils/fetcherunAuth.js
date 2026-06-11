import { API_BASE_URL_LOGIN, API_ENDPOINTS } from "./apiConfig";

// Function to refresh the access token
const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await fetch(`${API_BASE_URL_LOGIN}${API_ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
  
      const data = await response.json();
      localStorage.setItem('access_token', data.access); // Store the new access token
      return data.access;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  };
  
  // Define a fetch wrapper function
  const fetchWrapper = async (url, options = {}) => {
    // Add the Authorization header if an access token is available
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
  
    let response = await fetch(url, options);
  
    // If the response status is 401, attempt to refresh the token and retry the request
    if (response.status === 401) {
      try {
        const newAccessToken = await refreshToken();
  
        // Update the Authorization header with the new token
        options.headers.Authorization = `Bearer ${newAccessToken}`;
  
        // Retry the original request with the new token
        response = await fetch(url, options);
      } catch (refreshError) {
        // Redirect to login or handle the error as needed
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw refreshError;
      }
    }
  
    return response;
  };
  
  export default fetchWrapper;
  