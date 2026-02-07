import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../redux/store';
import { updateAccessToken, logout } from '../redux/auth/authSlice';

// Base API URL
// IMPORTANT: If using physical device, run server as: python manage.py runserver 0.0.0.0:8000
import { getBaseUrl } from '../config';

const BASE_URL = getBaseUrl();

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Add Token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const state = store.getState();
      const refresh = state.auth.refreshToken;
      
      if (refresh) {
        try {
          // Attempt to refresh token
          const response = await axios.post(`${BASE_URL}auth/refresh/`, {
            refresh: refresh,
          });
          
          const newAccessToken = response.data.access;
          
          // Update store
          store.dispatch(updateAccessToken(newAccessToken));
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          store.dispatch(logout());
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available
        store.dispatch(logout());
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
