import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthenticatedSidebar } from "./AuthenticatedSidebar"
import { RightSidebar } from "./RightSidebar"
import { Pagination } from "./Pagination"
import authService from "../../api/services/authService"
import forumService from "../../api/services/forumService"
import type { Post } from "../../api/types/forumType"
import { STORAGE_KEYS } from "../../api/config"
import { PostCard } from "./PostCard"

const MyLikesPage: React.FC = () => {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [likedPosts, setLikedPosts] = useState<Post[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)

    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
        setIsAuthenticated(!!token)
        
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
            setCurrentUserId(currentUser.userId)
        }
    }, [])

    const fetchLikedPosts = async () => {
        if (!currentUserId) return

        setLoading(true)
        setError(null)
        try {
            // Get all posts
            const postsResponse = await forumService.getPosts({
                limit: 100,
                page: 1,
                sort: "newest",
            })

            // Filter only liked posts
            const liked = postsResponse.posts.filter(post => post.liked)

            // Paginate
            const itemsPerPage = 10
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const paginatedPosts = liked.slice(startIndex, endIndex)

            setLikedPosts(paginatedPosts)
            setTotalPages(Math.ceil(liked.length / itemsPerPage))
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tải bài đăng đã thích')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLikedPosts()
    }, [currentPage, currentUserId])

    const handleLike = async (postId: number, isCurrentlyLiked: boolean) => {
        setLikedPosts(likedPosts.map(post =>
            post.postId === postId
                ? {
                    ...post,
                    liked: !isCurrentlyLiked,
                    likesCount: isCurrentlyLiked ? post.likesCount - 1 : post.likesCount + 1
                }
                : post
        ))

        try {
            if (isCurrentlyLiked) {
                await forumService.unlikePost(postId)
                // Remove from list if unliked
                setLikedPosts(likedPosts.filter(post => post.postId !== postId))
            } else {
                await forumService.likePost(postId)
            }
        } catch (err: any) {
            setLikedPosts(likedPosts.map(post =>
                post.postId === postId
                    ? {
                        ...post,
                        liked: isCurrentlyLiked,
                        likesCount: isCurrentlyLiked ? post.likesCount + 1 : post.likesCount - 1
                    }
                    : post
            ))
            alert(err.message || 'Có lỗi xảy ra')
        }
    }

    const handlePostClick = (postId: number) => {
        navigate(`/users/forum/posts/${postId}`)
    }

    return (
        <div className="flex h-screen bg-white pt-8">
            <AuthenticatedSidebar />

            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-5xl mx-auto px-12 pt-8 pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Bài đăng đã thích</h1>
                    </div>

                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-gray-600">Đang tải...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {!loading && !error && likedPosts.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Bạn chưa thích bài đăng nào</p>
                        </div>
                    )}

                    {!loading && !error && likedPosts.length > 0 && (
                        <div>
                            {likedPosts.map((post) => (
                                <PostCard 
                                    key={post.postId}
                                    post={post} 
                                    onLike={handleLike}
                                    onPostClick={handlePostClick}
                                    isAuthenticated={isAuthenticated}
                                />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={setCurrentPage} 
                        />
                    )}
                </div>
            </div>

            <RightSidebar />
        </div>
    )
}

export default MyLikesPage