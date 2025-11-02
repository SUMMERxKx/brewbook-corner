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
};
