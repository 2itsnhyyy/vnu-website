import apiClient from "../apiClient";
import type { 
    PostsResponse, 
    GetPostsParams, 
    PostDetailResponse,
    CommentsResponse,
    GetCommentsParams,
    CreateCommentParams,
    CreateCommentResponse,
    UpdateCommentParams,
    UpdateCommentResponse,
    CreatePostParams,
    CreatePostResponse,
    UpdatePostParams,
    UpdatePostResponse,
    DeletePostResponse
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

    async createPost(params: CreatePostParams): Promise<CreatePostResponse> {
        try {
            const response = await apiClient.post<CreatePostResponse>("/posts", {
                title: params.title,
                contentMarkdown: params.contentMarkdown,
            });
            return response.data;
        } catch (error: any) {
            if (error.status === 401) {
                throw new Error("Bạn cần đăng nhập để tạo bài đăng");
            }
            console.error("Error creating post:", error);
            throw new Error(error.message || "Không thể tạo bài đăng");
        }
    }

    async updatePost(postId: number, params: UpdatePostParams): Promise<UpdatePostResponse> {
        try {
            const response = await apiClient.patch<UpdatePostResponse>(`/posts/${postId}`, {
                title: params.title,
                contentMarkdown: params.contentMarkdown,
            });
            return response.data;
        } catch (error: any) {
            if (error.status === 401) {
                throw new Error("Bạn cần đăng nhập để chỉnh sửa bài đăng");
            }
            if (error.status === 403) {
                throw new Error("Bạn không có quyền chỉnh sửa bài đăng này");
            }
            console.error("Error updating post:", error);
            throw new Error(error.message || "Không thể cập nhật bài đăng");
        }
    }

    async deletePost(postId: number): Promise<DeletePostResponse> {
        try {
            const response = await apiClient.delete<DeletePostResponse>(`/posts/${postId}`);
            return response.data;
        } catch (error: any) {
            if (error.status === 401) {
                throw new Error("Bạn cần đăng nhập để xóa bài đăng");
            }
            if (error.status === 403) {
                throw new Error("Bạn không có quyền xóa bài đăng này");
            }
            console.error("Error deleting post:", error);
            throw new Error(error.message || "Không thể xóa bài đăng");
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

    async updateComment(commentId: number, params: UpdateCommentParams): Promise<UpdateCommentResponse> {
        try {
            const response = await apiClient.patch<UpdateCommentResponse>(`/comments/${commentId}`, {
                content: params.content
            });
            return response.data;
        } catch (error: any) {
            if (error.status === 401) {
                throw new Error("Bạn cần đăng nhập để chỉnh sửa bình luận");
            }
            if (error.status === 403) {
                throw new Error("Bạn không có quyền chỉnh sửa bình luận này");
            }
            console.error("Error updating comment:", error);
            throw new Error(error.message || "Không thể cập nhật bình luận");
        }
    }

    async deleteComment(commentId: number): Promise<{ message: string }> {
        try {
            const response = await apiClient.delete(`/comments/${commentId}`);
            return response.data;
        } catch (error: any) {
            if (error.status === 401) {
                throw new Error("Bạn cần đăng nhập để xóa bình luận");
            }
            if (error.status === 403) {
                throw new Error("Bạn không có quyền xóa bình luận này");
            }
            console.error("Error deleting comment:", error);
            throw new Error(error.message || "Không thể xóa bình luận");
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
