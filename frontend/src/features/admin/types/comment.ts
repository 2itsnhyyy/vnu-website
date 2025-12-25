import type { User } from "./user";

export interface Comment {
  commentId: number;
  content: string;
  parent: number | null;
  postId: number;
  author: number | User;
  createdAt: string;
  updatedAt: string;
}

export interface GetCommentsResponse {
  comments: Comment[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface GetCommentResponse {
  comment: Comment;
}
