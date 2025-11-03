import axiosInstance from './axios';
import { UserProfile, Post, User, SearchUser } from '@/types';

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

  async sendFriendRequest(userId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(`/api/users/${userId}/send-request`);
    return response.data;
  },

  async acceptFriendRequest(userId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(`/api/users/${userId}/accept-request`);
    return response.data;
  },

  async rejectFriendRequest(userId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(`/api/users/${userId}/reject-request`);
    return response.data;
  },

  async getFriendRequests(userId: string): Promise<{ incoming: User[]; outgoing: User[] }> {
    const response = await axiosInstance.get<{ incoming: User[]; outgoing: User[] }>(`/api/users/${userId}/requests`);
    return response.data;
  },

  async searchUsers(query: string): Promise<SearchUser[]> {
    const response = await axiosInstance.get<SearchUser[]>(`/api/users/search`, {
      params: { query }
    });
    return response.data;
  },
};

