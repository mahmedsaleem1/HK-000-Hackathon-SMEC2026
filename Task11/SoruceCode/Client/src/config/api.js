import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
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

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
  getPortfolio: (userId) => api.get(`/auth/portfolio/${userId}`)
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getMyPosted: () => api.get('/tasks/my/posted'),
  getMyAssigned: () => api.get('/tasks/my/assigned')
};

// Bids API
export const bidsAPI = {
  create: (data) => api.post('/bids', data),
  getTaskBids: (taskId, sortBy) => api.get(`/bids/task/${taskId}`, { params: { sortBy } }),
  accept: (id) => api.put(`/bids/${id}/accept`),
  complete: (id, data) => api.put(`/bids/${id}/complete`, data),
  withdraw: (id) => api.put(`/bids/${id}/withdraw`),
  getMyBids: () => api.get('/bids/my')
};

export default api;
