import api from "./api";
import type { GetUsersResponse, User } from "../types/user";

export const userService = {
  getAll(page = 1, limit = 10): Promise<GetUsersResponse> {
    return api
      .get("/users", {
        params: { page, limit },
      })
      .then((res) => res.data);
  },

  getById(id: number): Promise<User> {
    return api.get(`/users/${id}`).then((res) => res.data.user);
  },
};
