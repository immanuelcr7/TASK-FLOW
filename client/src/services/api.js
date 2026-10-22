import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send & receive HttpOnly cookies across requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format errors cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorResponse = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred. Please try again.',
      errors: error.response?.data?.errors || null,
      status: error.response?.status || 500,
    };
    return Promise.reject(errorResponse);
  }
);

// Auth Service
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Task Service
export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, updates) => api.patch(`/tasks/${id}`, updates),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

// Dashboard Service
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

// User Profile Service
export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (profileData) => api.patch('/users/me', profileData),
  changePassword: (passwordData) => api.patch('/users/me/password', passwordData),
};

export default api;
