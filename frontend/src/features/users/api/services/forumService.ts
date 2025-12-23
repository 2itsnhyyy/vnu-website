import apiClient from "../apiClient";
import type { 
    PostsResponse, 
    GetPostsParams, 
    PostDetailResponse,
    CommentsResponse,
    GetCommentsParams,
    CreateCommentParams,
    CreateCommentResponse
} from "../types/forumType";

class ForumService {
    // Posts
    async getPosts(params?: GetPostsParams): Promise<PostsResponse> {
        try {
            const response = await apiClient.get<PostsResponse>("/posts", {
                params: {
                    limit: params?.limit || 10,
                    page: params?.page || 1,
                    sort: params?.sort || "newest",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching posts:", error);
            throw error;
        }
    }

    async getPostDetail(postId: number): Promise<PostDetailResponse> {
        try {
            const response = await apiClient.get<PostDetailResponse>(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching post detail:", error);
            throw error;
        }
    }

    async likePost(postId: number): Promise<{ message: string }> {
        try {
            const response = await apiClient.post(`/posts/${postId}/likes`);
            return response.data;
        } catch (error: any) {
            if (error.status === 401) {
                throw new Error("Bạn cần đăng nhập để thích bài viết");
            }
            if (
                error.status === 400 &&
                error.data?.message === "You already liked this post"
            ) {
                throw new Error("Bạn đã thích bài viết này rồi");
            }
            console.error("Error liking post:", error);
            throw new Error(error.message || "Không thể thích bài viết");
        }
    }

    async unlikePost(postId: number): Promise<{ message: string }> {
        try {
            const response = await apiClient.delete(`/posts/${postId}/likes`);
            return response.data;
        } catch (error: any) {
            if (
                error.status === 400 &&
                error.data?.message === "You have not liked this post"
            ) {
                throw new Error("Bạn chưa thích bài viết này");
            }
            console.error("Error unliking post:", error);
            throw new Error(error.message || "Không thể bỏ thích bài viết");
        }
    }

    // Comments
    async getComments(postId: number, params?: GetCommentsParams): Promise<CommentsResponse> {
        try {
            const queryParams: any = {
                limit: params?.limit || 10,
                page: params?.page || 1,
                sort: params?.sort || "newest",
            };

            // Only add parent if it's explicitly set (can be null or a number)
            if (params?.parent !== undefined) {
                queryParams.parent = params.parent;
            }

            const response = await apiClient.get<CommentsResponse>(`/posts/${postId}/comments`, {
                params: queryParams,
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching comments:", error);
            throw error;
        }
    }

    async createComment(postId: number, params: CreateCommentParams): Promise<CreateCommentResponse> {
        try {
            // Only include parent in body if it's provided
            const body: any = {
                content: params.content,
            };

            if (params.parent !== undefined && params.parent !== null) {
                body.parent = params.parent;
            }

            const response = await apiClient.post<CreateCommentResponse>(`/posts/${postId}/comments`, body);
            return response.data;
        } catch (error: any) {
            if (error.status === 401) {
                throw new Error("Bạn cần đăng nhập để bình luận");
            }
            console.error("Error creating comment:", error);
            throw new Error(error.message || "Không thể tạo bình luận");
        }
    }

    async likeComment(commentId: number): Promise<{ message: string }> {
        try {
            const response = await apiClient.post(`/comments/${commentId}/like`);
            return response.data;
        } catch (error: any) {
            if (error.status === 401) {
                throw new Error("Bạn cần đăng nhập để thích bình luận");
            }
            if (
                error.status === 400 &&
                error.data?.message === "You already liked this comment"
            ) {
                throw new Error("Bạn đã thích bình luận này rồi");
            }
            console.error("Error liking comment:", error);
            throw new Error(error.message || "Không thể thích bình luận");
        }
    }

    async unlikeComment(commentId: number): Promise<{ message: string }> {
        try {
            const response = await apiClient.delete(`/comments/${commentId}/like`);
            return response.data;
        } catch (error: any) {
            if (
                error.status === 400 &&
                error.data?.message === "You have not liked this comment"
            ) {
                throw new Error("Bạn chưa thích bình luận này");
            }
            console.error("Error unliking comment:", error);
            throw new Error(error.message || "Không thể bỏ thích bình luận");
        }
    }
    async uploadImages(files: File[]): Promise<Array<{
        url: string;
        publicId: string;
        height: number;
        width: number;
        format: string;
        resourceType: string;
    }>> {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await apiClient.post('/cloudinary/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            return response.data;
        } catch (error: any) {
            console.error("Error uploading images:", error);
            throw new Error(error.message || "Không thể upload ảnh");
        }
    }
}

export default new ForumService();
