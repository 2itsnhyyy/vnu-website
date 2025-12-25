export interface CommentAuthor {
  userId: number;
  name: string;
  avatar: string;
}

export interface Comment {
  commentId: number;
  content: string;
  parent: number | null;
  postId: number;
  author: CommentAuthor;
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
