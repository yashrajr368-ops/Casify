import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('retech_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthenticated or token expired, remove stored credential
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('retech_token');
        localStorage.removeItem('retech_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Catalog Services
export const catalogAPI = {
  getCategories: () => api.get('/catalog/categories'),
  getBrands: (category) => api.get('/catalog/brands', { params: { category } }),
  getModels: (category, brand) => api.get('/catalog/models', { params: { category, brand } }),
  getAll: (params) => api.get('/catalog', { params }),
};

// Device Services
export const devicesAPI = {
  create: (deviceData) => api.post('/devices', deviceData),
  list: (params) => api.get('/devices', { params }),
  get: (id) => api.get(`/devices/${id}`),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
  uploadImage: (id, formData) => api.post(`/devices/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ML Valuation / Prediction Services
export const predictionAPI = {
  predict: (specs) => api.post('/predict', specs),
  list: () => api.get('/predictions'),
  get: (id) => api.get(`/predictions/${id}`),
};

// Sell Services
export const sellAPI = {
  create: (sellData) => api.post('/sell', sellData),
  list: () => api.get('/sell'),
  get: (id) => api.get(`/sell/${id}`),
  updateStatus: (id, data) => api.put(`/sell/${id}/status`, data),
};

// Exchange Services
export const exchangeAPI = {
  create: (exchangeData) => api.post('/exchange', exchangeData),
  list: () => api.get('/exchange'),
  get: (id) => api.get(`/exchange/${id}`),
  updateStatus: (id, data) => api.put(`/exchange/${id}/status`, data),
};

// Repair Services
export const repairAPI = {
  getEstimate: (repairType, category) => api.get('/repair/estimate', { params: { repair_type: repairType, category } }),
  create: (repairData) => api.post('/repair', repairData),
  list: () => api.get('/repair'),
  get: (id) => api.get(`/repair/${id}`),
  updateStatus: (id, data) => api.put(`/repair/${id}/status`, data),
};

// Pickup Services
export const pickupAPI = {
  create: (pickupData) => api.post('/pickup', pickupData),
  list: () => api.get('/pickup'),
  updateStatus: (id, data) => api.put(`/pickup/${id}/status`, data),
};

// Notifications Services
export const notificationAPI = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// User / Customer Dashboard
export const userAPI = {
  getDashboard: () => api.get('/users/dashboard'),
};

// Admin Services
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getRequests: (params) => api.get('/admin/requests', { params }),
  assignAgent: (assignmentData) => api.put('/admin/assign-agent', assignmentData),
  getAgents: () => api.get('/admin/agents'),
  createCatalog: (data) => api.post('/admin/catalog', data),
  updateCatalog: (id, data) => api.put(`/admin/catalog/${id}`, data),
  deleteCatalog: (id) => api.delete(`/admin/catalog/${id}`),
};

// Agent Services
export const agentAPI = {
  getTasks: () => api.get('/agent/tasks'),
  submitInspection: (sellId, data) => api.post(`/agent/inspection/${sellId}`, data),
};

export default api;
