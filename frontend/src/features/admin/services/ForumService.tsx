import api from "./api";
import type {
  Post,
  GetPostsResponse,
  PostEditRequest,
  PostCreateRequest,
} from "../types/post";

export const forumService = {
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: number;
  }): Promise<GetPostsResponse> {
    return api
      .get("/posts", {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
          author: params?.userId,
        },
      })
      .then((res) => res.data);
  },

  getById(id: number): Promise<Post> {
    return api.get(`/posts/${id}`).then((res) => res.data.post);
  },

  create(data: PostCreateRequest): Promise<Post> {
    return api.post("/posts/", data).then((res) => res.data.post);
  },

  update(id: number, data: PostEditRequest): Promise<Post> {
    return api.patch(`/posts/${id}`, data).then((res) => res.data.post);
  },

  delete(id: number): Promise<{ success: boolean; message: string }> {
    return api.delete(`/posts/${id}`).then((res) => res.data.post);
  },

  getByUserId(id: number, page = 1, limit = 10): Promise<GetPostsResponse> {
    return api
      .get(`/posts/user/${id}`, {
        params: { page, limit },
      })
      .then((res) => res.data);
  },
};
