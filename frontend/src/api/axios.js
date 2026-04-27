import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add auth token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fdm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('fdm_token');
      localStorage.removeItem('fdm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
