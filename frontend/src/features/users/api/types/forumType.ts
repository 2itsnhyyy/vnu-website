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

export interface Comment {
    commentId: number;
    content: string;
    parent: number | null;
    postId: number;
    author: Author;
    createdAt: string;
    updatedAt: string;
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

export interface PostDetailResponse {
    post: Post;
}

export interface CommentsResponse {
    pagination: Pagination;
    comments: Comment[];
}

export interface CreateCommentResponse {
    message: string;
    comment: Comment;
}

export interface GetPostsParams {
    limit?: number;
    page?: number;
    sort?: "newest" | "top" | "unanswered" | "answered";
}

export interface GetCommentsParams {
    limit?: number;
    page?: number;
    parent?: number | null;
    sort?: "oldest" | "newest" | "hottest";
}

export interface CreateCommentParams {
    content: string;
    parent?: number | null;
}