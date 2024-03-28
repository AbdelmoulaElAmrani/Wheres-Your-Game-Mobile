import { AuthService } from '@/services/AuthService';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { router } from 'expo-router';


// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://your.api/base/url',
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const token = AuthService.getAccessToken();
    if (token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest?._retry = true;
      try {
        const newAccessToken = await AuthService.refreshToken();
        if (originalRequest?.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        //navigate('Login'); // Use your login screen's route name
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
