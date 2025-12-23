export interface Author {
    email: string;
    name: string;
    birthday: string;
    avatar: string;
    role: number;
    userId: number;
}

export interface Post {
    postId: number;
    title: string;
    contentMarkdown: string;
    createdAt: string;
    updatedAt: string;
    author: Author;
    likesCount: number;
    commentsCount: number;
    liked: boolean;
}

export interface Pagination {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
}

export interface PostsResponse {
    pagination: Pagination;
    posts: Post[];
}

export interface GetPostsParams {
    limit?: number;
    page?: number;
    sort?: "newest" | "top" | "unanswered" | "answered";
}
