import api from "./api";
import type {
  GetCommentsResponse,
  CommentUpdateRequest,
  Comment,
} from "../types/comment";

export const commentService = {
  getAll(
    postId: number,
    params?: {
      page?: number;
      limit?: number;
      parent?: number;
    }
  ): Promise<GetCommentsResponse> {
    return api
      .get(`/posts/${postId}/comments`, {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          parent: params?.parent,
        },
      })
      .then((res) => res.data);
  },

  update(id: number, data: CommentUpdateRequest): Promise<Comment> {
    return api.patch(`/comments/${id}`, data).then((res) => res.data.comment);
  },

  delete(id: number): Promise<{ success: boolean; message: string }> {
    return api.delete(`/comments/${id}`).then((res) => res.data.comment);
  },
};
