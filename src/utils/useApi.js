import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const request = useCallback(async (method, endpoint, { id = null, params = {}, body = {} }) => {
    setLoading(true);
    setError(null);
    try {
      const url = id ? `${API_BASE_URL}${endpoint}/${id}` : `${API_BASE_URL}${endpoint}`;
      const config = {
        method,
        url,
        params,
        data: body,
        headers: { 'Content-Type': 'application/json' },
      };

      const response = await axios(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      console.error(`${method} request failed:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = (endpoint, Id = null, params = {}) => request('get', endpoint, { id: Id, params });
  const post = (endpoint, requestData) => request('post', endpoint, { body: requestData });
  const patch = (endpoint, id, body) => request('patch', endpoint, { id, body });

  return {
    loading,
    error,
    data,
    get,
    post,
    patch,
  };
};

export default useApi;
