// services/userService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambah token otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userService = {
  // Get all users
  getUsers: () => api.get('/user/list').then(res => res.data),
  
  // Create new user
  createUser: (userData) => api.post('/user/create', userData).then(res => res.data),
  
  // Update user
  updateUser: (id, userData) => api.put(`/user/update/${id}`, userData).then(res => res.data),
  
  // Delete user
  deleteUser: (id) => api.delete(`/user/delete/${id}`).then(res => res.data),
};

export default api;