import axiosInstance from './axios';
import { Notification } from '@/types';

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationsAPI = {
  async getNotifications(): Promise<NotificationsResponse> {
    const response = await axiosInstance.get<NotificationsResponse>('/api/notifications');
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/api/notifications/read-all');
    return response.data;
  },
};

