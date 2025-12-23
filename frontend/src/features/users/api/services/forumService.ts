import apiClient from "../apiClient";
import type { PostsResponse, GetPostsParams } from "../types/forumType";

class ForumService {
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
}

export default new ForumService();
