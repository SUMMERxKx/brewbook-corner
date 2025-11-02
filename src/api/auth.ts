import axiosInstance from './axios';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types';
import { mockUser, delay } from './mockData';

// Using mock data for now - replace with real API calls later
export const authAPI = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await delay(800);
    // Mock response
    const user = {
      ...mockUser,
      username: credentials.username,
      email: credentials.email,
      side: credentials.side,
    };
    const token = 'mock_jwt_token_' + Date.now();
    
    // Uncomment when backend is ready:
    // const response = await axiosInstance.post<AuthResponse>('/api/auth/register', credentials);
    // return response.data;
    
    return { token, user };
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800);
    // Mock response
    const token = 'mock_jwt_token_' + Date.now();
    
    // Uncomment when backend is ready:
    // const response = await axiosInstance.post<AuthResponse>('/api/auth/login', credentials);
    // return response.data;
    
    return { token, user: mockUser };
  },

  async logout(): Promise<void> {
    await delay(300);
    // Clear local storage
    localStorage.removeItem('brewbook_token');
    localStorage.removeItem('brewbook_user');
  },
};
