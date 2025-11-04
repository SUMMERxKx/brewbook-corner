import axiosInstance from './axios';
import { Post, CreatePostData, CreateCommentData, Side } from '@/types';

// Posts API - connected to backend
export const postsAPI = {
  async getPosts(side?: Side): Promise<Post[]> {
    const response = await axiosInstance.get<Post[]>('/api/posts', { 
      params: side ? { side } : {} 
    });
    return response.data;
  },

  async getPost(id: string): Promise<Post> {
    const response = await axiosInstance.get<Post>(`/api/posts/${id}`);
    return response.data;
  },

  async createPost(data: CreatePostData): Promise<Post> {
    const response = await axiosInstance.post<Post>('/api/posts', data);
    return response.data;
  },

  async addComment(postId: string, data: CreateCommentData): Promise<Post> {
    const response = await axiosInstance.post<Post>(`/api/posts/${postId}/comments`, data);
    return response.data;
  },

  async likePost(postId: string): Promise<Post> {
    const response = await axiosInstance.post<Post>(`/api/posts/${postId}/like`);
    return response.data;
  },

  async deletePost(postId: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/api/posts/${postId}`);
    return response.data;
  },

  // Multi-feed endpoints
  async getDiscoverFeed(): Promise<Post[]> {
    const response = await axiosInstance.get<Post[]>('/api/posts/discover');
    return response.data;
  },

  async getFriendsFeed(): Promise<Post[]> {
    const response = await axiosInstance.get<Post[]>('/api/posts/friends');
    return response.data;
  },

  async getSideFeed(): Promise<Post[]> {
    const response = await axiosInstance.get<Post[]>('/api/posts/side');
    return response.data;
  },
};

export type FeedType = 'discover' | 'friends' | 'side';
