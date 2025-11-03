import axiosInstance from './axios';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types';

// Auth API - connected to backend
export const authAPI = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/register', credentials);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('brewbook_token');
    localStorage.removeItem('brewbook_user');
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/api/auth/request-reset', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/api/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  },
};
