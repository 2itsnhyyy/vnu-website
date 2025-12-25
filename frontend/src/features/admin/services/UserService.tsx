import api from "./api";
import type { GetUsersResponse, User } from "../types/user";

export const userService = {
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<GetUsersResponse> {
    return api
      .get("/users", {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
        },
      })
      .then((res) => res.data);
  },

  getById(id: number): Promise<User> {
    return api.get(`/users/${id}`).then((res) => res.data.user);
  },

  delete(id: number): Promise<{ success: boolean; message: string }> {
    return api.delete(`/users/${id}`).then((res) => res.data.user);
  },
};
