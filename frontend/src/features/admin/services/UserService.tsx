import api from "./api";
import type { GetUsersResponse } from "../types/user";

export const userService = {
  getAll(page = 1, limit = 10): Promise<GetUsersResponse> {
    return api
      .get("/users", {
        params: { page, limit },
      })
      .then((res) => res.data);
  },
};
