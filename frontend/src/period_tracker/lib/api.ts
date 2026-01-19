import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    }
    // Network error or backend not running
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      return Promise.reject({
        success: false,
        message: 'Network Error',
        error: 'Cannot connect to backend server. Please make sure the backend is running on port 5000.',
      });
    }
    return Promise.reject({
      success: false,
      message: error.message || 'Network Error',
      error: error.message || 'Unable to connect to server',
    });
  }
);

// Cycle APIs
export const cycleAPI = {
  getAll: () => api.get('/cycles'),
  getById: (id: number) => api.get(`/cycles/${id}`),
  create: (data: any) => api.post('/cycles', data),
  update: (id: number, data: any) => api.put(`/cycles/${id}`, data),
  delete: (id: number) => api.delete(`/cycles/${id}`),
  getStatistics: () => api.get('/cycles/statistics'),
  getInsights: () => api.get('/cycles/insights'),
  getDashboard: () => api.get('/cycles/dashboard'),
};

// Symptom APIs
export const symptomAPI = {
  create: (data: any) => api.post('/symptoms', data),
  getByCycle: (cycleId: number) => api.get(`/symptoms/cycle/${cycleId}`),
  getStatistics: () => api.get('/symptoms/statistics'),
  delete: (id: number) => api.delete(`/symptoms/${id}`),
  // Week2 compatibility / bulk save and list
  saveBulk: (data: any) => api.post('/symptoms/save', data),
  list: (params?: any) => api.get('/symptoms/list', { params }),
};

// User APIs (preferences)
export const userAPI = {
  savePreferences: (data: any) => api.post('/users/preferences', data),
  getPreferences: (params?: any) => api.get('/users/preferences', { params }),
};

export default api;

