import apiClient from '../apiClient';
import type { NewsListResponse, NewsDetailResponse } from '../types/news.types';

const newsService = {
  getAll: async (page: number = 1, limit: number = 9, search?: string) => {
    const response = await apiClient.get<NewsListResponse>('/news', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await apiClient.get<NewsDetailResponse>(`/news/${id}`);
    return response.data;
  },
};

export default newsService;