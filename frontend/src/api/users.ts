import axiosInstance from './axios';
import { UserProfile, Post, User } from '@/types';

export interface UserProfileResponse {
  profile: UserProfile;
  posts: Post[];
}

// Users API
export const usersAPI = {
  async getUserProfile(username: string): Promise<UserProfileResponse> {
    const response = await axiosInstance.get<UserProfileResponse>(`/api/users/${username}`);
    return response.data;
  },

  async updateBio(userId: string, bio: string): Promise<User> {
    const response = await axiosInstance.patch<User>(`/api/users/${userId}/bio`, { bio });
    return response.data;
  },

  async switchSide(userId: string): Promise<{ message: string; user: User }> {
    const response = await axiosInstance.patch<{ message: string; user: User }>(
      `/api/users/${userId}/switch-side`
    );
    return response.data;
  },

  async getFriends(userId: string): Promise<{ friends: User[] }> {
    const response = await axiosInstance.get<{ friends: User[] }>(`/api/users/${userId}/friends`);
    return response.data;
  },

  async addFriend(userId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(`/api/users/${userId}/add-friend`);
    return response.data;
  },

  async removeFriend(userId: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/api/users/${userId}/remove-friend`);
    return response.data;
  },
};

