import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the token to headers if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trackbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem('trackbridge_token');
      
      // Redirect to login page
      // Note: If using standard window.location, this will cause a full page reload.
      // If you want to use React Router's navigation without reloading, you can export a custom history object,
      // or handle the redirect inside a top-level Axios interceptor setup within a React component.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
