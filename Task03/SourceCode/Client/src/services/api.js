/**
 * API Service Module
 * Centralized location for all backend API calls
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Expense API Endpoints
export const expenseAPI = {
  upload: (formData) => api.post('/expenses/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (filters = {}) => api.get('/expenses', { params: filters }),
  getById: (id) => api.get(`/expenses/${id}`),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Analytics API Endpoints
export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
  getByCategory: () => api.get('/analytics/by-category'),
  getDaily: () => api.get('/analytics/daily'),
  getTrends: (months = 12) => api.get('/analytics/trends', { params: { months } }),
  getForecast: () => api.get('/analytics/forecast'),
  getTopVendors: (limit = 10) => api.get('/analytics/top-vendors', { params: { limit } }),
  getCategoryTrends: (category) => api.get('/analytics/category-trends', { params: { category } }),
};

// Alerts API Endpoints
export const alertsAPI = {
  getAll: (filters = {}) => api.get('/alerts', { params: filters }),
  getById: (id) => api.get(`/alerts/${id}`),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  dismissAlert: (id) => api.put(`/alerts/${id}/dismiss`),
  delete: (id) => api.delete(`/alerts/${id}`),
  getSettings: () => api.get('/alerts/settings/current'),
  updateSettings: (settings) => api.post('/alerts/settings', settings),
};

export default api;
