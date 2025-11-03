import axiosInstance from './axios';
import { Chat, ChatMessage, ChatListItem } from '@/types';

export interface StartChatResponse {
  chat: Chat;
}

export interface SendMessageResponse {
  message: ChatMessage;
}

export interface GetChatsResponse {
  chats: ChatListItem[];
}

export interface GetChatResponse {
  chat: Chat;
}

// Chat API
export const chatAPI = {
  async startChat(friendId: string): Promise<StartChatResponse> {
    const response = await axiosInstance.post<StartChatResponse>('/api/chat/start', { friendId });
    return response.data;
  },

  async sendMessage(chatId: string, text: string): Promise<SendMessageResponse> {
    const response = await axiosInstance.post<SendMessageResponse>(
      `/api/chat/${chatId}/message`,
      { text }
    );
    return response.data;
  },

  async getUserChats(userId: string): Promise<GetChatsResponse> {
    const response = await axiosInstance.get<GetChatsResponse>(`/api/chat/user/${userId}`);
    return response.data;
  },

  async getChat(chatId: string): Promise<GetChatResponse> {
    const response = await axiosInstance.get<GetChatResponse>(`/api/chat/${chatId}`);
    return response.data;
  },
};

