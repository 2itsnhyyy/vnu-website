export interface Post {
  postId: number;
  title: string;
  author: {
    userId: number;
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt?: string;
  contentMarkdown: string;
}

export interface GetPostsResponse {
  posts: Post[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface PostEditRequest {
  title?: string;
  contentMarkdown?: string;
}
