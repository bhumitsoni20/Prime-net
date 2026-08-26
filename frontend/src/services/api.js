import axios from 'axios';
import { getIdToken, signOut } from '../firebase/auth';
import useAuthStore from '../store/authStore';
import { handleApiError } from '../lib/errorHandler';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Firebase Token
api.interceptors.request.use(
  async (config) => {
    try {
      let token = await getIdToken();
      if (!token) {
        token = useAuthStore.getState().token;
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to attach auth token', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => {
    // Axios wraps response in 'data' object. If your backend wraps in { success, data, message }
    // return response.data makes it easier for components.
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      try {
        await signOut();
      } catch (err) {
        console.warn('Firebase signout failed', err);
      }
      // Instantly force page reload to log out completely and prevent hanging states
      window.location.href = '/login';
    }
    console.error('FRONTEND CATCH:', error.response?.data); 
    handleApiError(error);
    return Promise.reject(error);
  }
);

export const apiGet = (endpoint, config = {}) => api.get(endpoint, config);
export const apiPost = (endpoint, body, config = {}) => api.post(endpoint, body, config);
export const apiPut = (endpoint, body, config = {}) => api.put(endpoint, body, config);
export const apiDelete = (endpoint, config = {}) => api.delete(endpoint, config);
export const apiPatch = (endpoint, body, config = {}) => api.patch(endpoint, body, config);

export default api;
