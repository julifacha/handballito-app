import axios from 'axios';

// Get the API base URL from environment variables
// Default to http://localhost:5000/api if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // You can add authentication tokens here
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - Please login');
          // Handle unauthorized access
          break;
        case 403:
          console.error('Forbidden - Access denied');
          break;
        case 404:
          console.error('Not Found - Resource not found');
          break;
        case 500:
          console.error('Server Error - Please try again later');
          break;
        default:
          console.error('An error occurred:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error - Please check your connection');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

