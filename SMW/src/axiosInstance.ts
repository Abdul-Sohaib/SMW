/* eslint-disable @typescript-eslint/no-explicit-any */
// src/axiosInstance.ts
import axios from 'axios';

const BASE_URL = import.meta.env.PROD 
  ? '/api'  // This will use Netlify's proxy
  : 'https://api.dgin.in/api';
  console.log('🔍 Axios BASE_URL:', BASE_URL, '| Production mode:', import.meta.env.PROD);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// === Token Helpers ===
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

// === Refresh Token API ===
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    console.log("🔁 Attempting refresh...");
    const response = await axios.post(`${BASE_URL}/auth/refreshtoken`, { refreshToken });

    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      console.log("✅ Token refreshed");
      return response.data.accessToken;
    } else {
      throw new Error('Token refresh failed');
    }
  } catch {
    localStorage.clear();
    window.location.href = '/login';
    return null;
  }
};

// === Request Interceptor ===
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Using token:", token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === Response Interceptor for 401 Handling ===
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("⚠️ 401 intercepted for", originalRequest.url);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              resolve(axiosInstance(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        if (!newToken) throw new Error('Refresh token expired');

        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
