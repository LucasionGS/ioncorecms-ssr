import axios, { type AxiosResponse } from 'axios';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3174/api';

// Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Longer timeout for file uploads
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface FileInfo {
  id: number;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FileListResponse {
  files: FileInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadProgressCallback {
  (progress: number): void;
}

export const fileApi = {
  /**
   * Upload a single file
   */
  async uploadFile(file: File, onProgress?: UploadProgressCallback): Promise<AxiosResponse<{ success: boolean; data: FileInfo; message: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },

  /**
   * Get file information by ID
   */
  async getFileInfo(fileId: number): Promise<AxiosResponse<{ success: boolean; data: FileInfo }>> {
    return api.get(`/files/${fileId}/info`);
  },

  /**
   * List all files with pagination
   */
  async listFiles(page = 1, limit = 20): Promise<AxiosResponse<{ success: boolean; data: FileListResponse }>> {
    return api.get('/files', {
      params: { page, limit }
    });
  },

  /**
   * Delete a file by ID
   */
  async deleteFile(fileId: number): Promise<AxiosResponse<{ success: boolean; message: string }>> {
    return api.delete(`/files/${fileId}`);
  },

  /**
   * Get the URL for accessing a file directly
   */
  getFileUrl(fileId: number): string {
    return `${API_BASE_URL}/files/${fileId}`;
  },

  /**
   * Check if a file type is an image
   */
  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  },

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[], 
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<FileInfo[]> {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const response = await this.uploadFile(file, (progress) => {
          if (onProgress) {
            onProgress(index, progress);
          }
        });
        return response.data.data;
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  }
};