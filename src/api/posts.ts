import axiosInstance from './axios';
import { Post, CreatePostData, CreateCommentData, Side } from '@/types';
import { mockPosts, delay } from './mockData';

// Using mock data for now - replace with real API calls later
export const postsAPI = {
  async getPosts(side?: Side): Promise<Post[]> {
    await delay(600);
    let posts = [...mockPosts];
    if (side) {
      posts = posts.filter(p => p.side === side);
    }
    
    // Uncomment when backend is ready:
    // const response = await axiosInstance.get<Post[]>('/api/posts', { params: { side } });
    // return response.data;
    
    return posts;
  },

  async getPost(id: string): Promise<Post> {
    await delay(500);
    const post = mockPosts.find(p => p._id === id);
    if (!post) throw new Error('Post not found');
    
    // Uncomment when backend is ready:
    // const response = await axiosInstance.get<Post>(`/api/posts/${id}`);
    // return response.data;
    
    return post;
  },

  async createPost(data: CreatePostData): Promise<Post> {
    await delay(800);
    const user = JSON.parse(localStorage.getItem('brewbook_user') || '{}');
    const newPost: Post = {
      _id: 'p' + Date.now(),
      ...data,
      side: user.side || 'coffee',
      user: {
        username: user.username || 'Anonymous',
        side: user.side || 'coffee',
        avatar: user.avatar
      },
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    
    // Uncomment when backend is ready:
    // const response = await axiosInstance.post<Post>('/api/posts', data);
    // return response.data;
    
    return newPost;
  },

  async addComment(postId: string, data: CreateCommentData): Promise<Post> {
    await delay(500);
    const user = JSON.parse(localStorage.getItem('brewbook_user') || '{}');
    
    // Mock: just return the post with new comment
    const post = mockPosts.find(p => p._id === postId);
    if (!post) throw new Error('Post not found');
    
    // Uncomment when backend is ready:
    // const response = await axiosInstance.post<Post>(`/api/posts/${postId}/comments`, data);
    // return response.data;
    
    return post;
  },

  async likePost(postId: string): Promise<Post> {
    await delay(300);
    const post = mockPosts.find(p => p._id === postId);
    if (!post) throw new Error('Post not found');
    
    // Uncomment when backend is ready:
    // const response = await axiosInstance.post<Post>(`/api/posts/${postId}/like`);
    // return response.data;
    
    return post;
  },
};
