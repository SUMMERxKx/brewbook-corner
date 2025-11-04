import axiosInstance from './axios';

export interface Recipe {
  title: string;
  ingredients: string[];
  steps: string[];
  tips?: string;
  side: 'coffee' | 'tea';
  fullText?: string;
}

export interface AIBaristaResponse {
  message: string;
  recipe: Recipe;
}

export const aiAPI = {
  async getBaristaResponse(prompt: string, side: 'coffee' | 'tea'): Promise<AIBaristaResponse> {
    const response = await axiosInstance.post<AIBaristaResponse>('/api/ai/barista', {
      prompt,
      side
    });
    return response.data;
  }
};

