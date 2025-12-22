import api from "./api";
import type { GetNewsResponse, News, NewsUpdateRequest } from "../types/news";

export const newsService = {
  getAll(page = 1, limit = 10): Promise<GetNewsResponse> {
    return api
      .get("/news", {
        params: { page, limit },
      })
      .then((res) => res.data);
  },

  getById(id: number): Promise<News> {
    return api.get(`/news/${id}`).then((res) => res.data.news);
  },

  update(id: number, data: NewsUpdateRequest): Promise<News> {
    return api.patch(`/news/${id}`, data).then((res) => res.data.news);
  },
};
