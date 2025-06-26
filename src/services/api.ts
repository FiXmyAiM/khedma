import axios from 'axios';
import { 
  User, 
  Admin, 
  Client, 
  Product, 
  Invoice, 
  DashboardData, 
  AIGeneratedContent,
  LoginForm,
  RegisterForm,
  ClientForm,
  ProductForm,
  InvoiceForm,
  LoginResponse,
  ApiResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
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
export const authApi = {
  login: async (data: LoginForm): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterForm): Promise<LoginResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  adminLogin: async (data: LoginForm): Promise<LoginResponse> => {
    const response = await api.post('/admin/login', data);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  createUser: async (data: any): Promise<ApiResponse<User>> => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: any): Promise<User> => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },
};

// Client API
export const clientApi = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get('/clients');
    return response.data;
  },

  create: async (data: ClientForm): Promise<Client> => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  update: async (id: string, data: ClientForm): Promise<Client> => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};

// Product API
export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  create: async (data: ProductForm): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: string, data: ProductForm): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// Invoice API
export const invoiceApi = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await api.get('/invoices');
    return response.data;
  },

  create: async (data: InvoiceForm): Promise<Invoice> => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  update: async (id: string, data: InvoiceForm): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },
};

// Dashboard API
export const dashboardApi = {
  getData: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

// AI API
export const aiApi = {
  generate: async (data: { type: string; prompt: string; context?: string }): Promise<{ content: string; id: string }> => {
    const response = await api.post('/ai/generate', data);
    return response.data;
  },

  getHistory: async (): Promise<AIGeneratedContent[]> => {
    const response = await api.get('/ai/history');
    return response.data;
  },
};

// Payment API
export const paymentApi = {
  createIntent: async (data: { plan: string; amount: number }): Promise<{ clientSecret: string }> => {
    const response = await api.post('/payments/create-intent', data);
    return response.data;
  },
};

export default api;
