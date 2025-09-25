import axios, { type AxiosResponse, type AxiosError } from 'axios';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  resourceLimit: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  isAdmin: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// System monitoring interfaces
export interface SystemMetrics {
  id: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  timestamp: string;
}

export interface ErrorLog {
  id: number;
  message: string;
  stack?: string;
  level: 'error' | 'warn' | 'info';
  userId?: number;
  timestamp: string;
}

// Admin API service
export const adminApiService = {
  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async verifyToken(): Promise<{ success: boolean; user?: User }> {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // User management (admin only)
  async getUsers(): Promise<{ success: boolean; data: { users: User[] } }> {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async updateUser(userId: number, updates: { resourceLimit?: number }): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.put(`/admin/users/${userId}`, updates);
    return response.data;
  },

  async toggleUserStatus(userId: number): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.patch(`/admin/users/${userId}/toggle`);
    return response.data;
  },

  async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async getAdminStats(): Promise<{ success: boolean; data: { stats: { totalUsers: number; activeUsers: number; adminUsers: number } } }> {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // System monitoring
  async getSystemMetrics(): Promise<{ success: boolean; data: SystemMetrics[] }> {
    const response = await api.get('/monitoring/metrics');
    return response.data;
  },

  // Error logging
  async getErrorLogs(limit?: number): Promise<{ success: boolean; data: { logs: ErrorLog[] } }> {
    const response = await api.get(`/errors/logs${limit ? `?limit=${limit}` : ''}`);
    return response.data;
  },

  async reportError(error: { message: string; stack?: string; level?: 'error' | 'warn' | 'info' }): Promise<{ success: boolean }> {
    const response = await api.post('/errors/report', error);
    return response.data;
  },

  // Database operations (admin only)
  async getDatabaseStatus(): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/admin/database/status');
    return response.data;
  },

  async runMigrations(): Promise<{ success: boolean; data: any }> {
    const response = await api.post('/admin/database/migrate');
    return response.data;
  },

  async rollbackMigration(): Promise<{ success: boolean; data: any }> {
    const response = await api.post('/admin/database/rollback');
    return response.data;
  },

  // Node Builder API methods
  async getNodeTypes(): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/node-builder/types');
    return response.data;
  },

  async getNodeTypeFields(nodeType: string): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/node-builder/types/${nodeType}/fields`);
    return response.data;
  },

  async getNodes(nodeType: string, params?: { page?: number; limit?: number; search?: string }): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/node-builder/types/${nodeType}/nodes`, { params });
    return response.data;
  },

  async getNode(nodeType: string, nodeId: number): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/node-builder/types/${nodeType}/nodes/${nodeId}`);
    return response.data;
  },

  async createNode(nodeType: string, nodeData: Record<string, any>): Promise<{ success: boolean; data: any }> {
    const response = await api.post(`/node-builder/types/${nodeType}/nodes`, nodeData);
    return response.data;
  },

  async updateNode(nodeType: string, nodeId: number, nodeData: Record<string, any>): Promise<{ success: boolean; data: any }> {
    const response = await api.put(`/node-builder/types/${nodeType}/nodes/${nodeId}`, nodeData);
    return response.data;
  },

  async deleteNode(nodeType: string, nodeId: number): Promise<{ success: boolean; data: any }> {
    const response = await api.delete(`/node-builder/types/${nodeType}/nodes/${nodeId}`);
    return response.data;
  },

  async getNodeUrl(nodeType: string, nodeId: number): Promise<{ success: boolean; data: { url: string } }> {
    const response = await api.get(`/nodes/${nodeType}/${nodeId}/url`);
    return response.data;
  },

  // Generic method for custom API calls
  async get(url: string, params?: any): Promise<AxiosResponse<any>> {
    return await api.get(url, { params });
  },

  async post(url: string, data?: any): Promise<AxiosResponse<any>> {
    return await api.post(url, data);
  },

  async put(url: string, data?: any): Promise<AxiosResponse<any>> {
    return await api.put(url, data);
  },

  async delete(url: string): Promise<AxiosResponse<any>> {
    return await api.delete(url);
  }
};

export default adminApiService;