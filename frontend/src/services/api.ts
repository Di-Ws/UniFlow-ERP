import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Ensure baseURL accounts for the new /api suffix architecture 
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token automatically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling (401, 403, 500)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Check if error response exists
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`[API Error] Status: ${status} | Payload:`, data);

      if (status === 401 || status === 403) {
        // Token is invalid/expired - force a logout if necessary
        console.warn('Authentication invalid or expired. Redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Quick & safe redirect
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
      }

      if (status >= 500) {
        console.error('Internal Server Error from Backend.');
      }
    } else if (error.request) {
      // Network errors (Server is down, no internet connection)
      console.error('[API Error] Network error or no response received:', error.request);
    } else {
      console.error('[API Error] Error setting up the request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
