import axiosInstance from './axios';

interface UploadResponse {
  message: string;
  url: string;
  path?: string;
}

export const uploadAPI = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axiosInstance.post<UploadResponse>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
