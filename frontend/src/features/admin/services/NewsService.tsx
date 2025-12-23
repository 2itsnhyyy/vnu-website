import api from "./api";
import type {
  GetNewsResponse,
  News,
  NewsUpdateRequest,
  NewsCreateRequest,
} from "../types/news";

export const newsService = {
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<GetNewsResponse> {
    return api
      .get("/news", {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
        },
      })
      .then((res) => res.data);
  },

  getById(id: number): Promise<News> {
    return api.get(`/news/${id}`).then((res) => res.data.news);
  },

  create(data: NewsCreateRequest): Promise<News> {
    return api.post("/news", data).then((res) => res.data.news);
  },

  update(id: number, data: NewsUpdateRequest): Promise<News> {
    return api.patch(`/news/${id}`, data).then((res) => res.data.news);
  },

  delete(id: number): Promise<{ success: boolean; message: string }> {
    return api.delete(`/news/${id}`).then((res) => res.data.news);
  },
};
