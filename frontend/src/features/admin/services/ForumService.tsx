import api from "./api";
import type { Post } from "../types/post";
import type { GetPostsResponse } from "../types/post";

export const forumService = {
  getAll(page = 1, limit = 10): Promise<GetPostsResponse> {
    return api
      .get("/posts", {
        params: { page, limit },
      })
      .then((res) => res.data);
  },
};
