import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Edit, Trash2 } from "lucide-react"
import { GuestSidebar } from "./GuestSidebar"
import { RightSidebar } from "./RightSidebar"
import { Pagination } from "./Pagination"
import { FilterTabs } from "./FilterTabs"
import { PostCard } from "./PostCard"
import forumService from "../../api/services/forumService"
import type { Post } from "../../api/types/forumType"
import { STORAGE_KEYS } from "../../api/config"

const ForumInterface: React.FC = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<"newest" | "answered" | "unanswered">("newest")
    const [currentPage, setCurrentPage] = useState(1)
    const [posts, setPosts] = useState<Post[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)

    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
        const userStr = localStorage.getItem(STORAGE_KEYS.USER)
        setIsAuthenticated(!!token)
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                setCurrentUserId(user.userId)
            } catch (e) {
                console.error("Error parsing user:", e)
            }
        }
    }, [])

    const fetchPosts = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await forumService.getPosts({
                limit: 10,
                page: currentPage,
                sort: activeTab,
            })
            setPosts(response.posts)
            setTotalPages(response.pagination.totalPages)
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tải bài đăng')
            console.error('Error loading posts:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [currentPage, activeTab])

    const handleLike = async (postId: number, isCurrentlyLiked: boolean) => {
        setPosts(posts.map(post =>
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
            } else {
                await forumService.likePost(postId)
            }
        } catch (err: any) {
            setPosts(posts.map(post =>
                post.postId === postId
                    ? {
                        ...post,
                        liked: isCurrentlyLiked,
                        likesCount: isCurrentlyLiked ? post.likesCount + 1 : post.likesCount - 1
                    }
                    : post
            ))
            
            alert(err.message || 'Có lỗi xảy ra')
            console.error('Error toggling like:', err)
        }
    }

    const handlePostClick = (postId: number) => {
        navigate(`posts/${postId}`)
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab as "newest" | "answered" | "unanswered")
        setCurrentPage(1)
    }

    const handleCreatePost = () => {
        if (!isAuthenticated) {
            alert("Bạn cần đăng nhập để tạo bài đăng")
            navigate("/users/login")
            return
        }
        navigate("/users/forum/create")
    }

    const handleEditPost = (postId: number) => {
        navigate(`/users/forum/edit/${postId}`)
    }

    const handleDeletePost = async (postId: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
            return
        }

        try {
            await forumService.deletePost(postId)
            setPosts(posts.filter(post => post.postId !== postId))
            alert("Xóa bài đăng thành công")
        } catch (error: any) {
            alert(error.message || "Có lỗi xảy ra khi xóa bài đăng")
            console.error("Error deleting post:", error)
        }
    }

    return (
        <div className="flex h-screen bg-white pt-8">
            <GuestSidebar />

            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-5xl mx-auto px-12 pt-8 pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Các bài đăng</h1>
                        {isAuthenticated ? (
                            <button
                                onClick={handleCreatePost}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={20} />
                                Đăng bài của bạn
                            </button>
                        ) : (
                            <div className="text-sm text-gray-500">
                                <a href="/users/login" className="text-blue-500 hover:underline">
                                    Đăng nhập
                                </a>
                                {" "}để đăng bài viết
                            </div>
                        )}
                    </div>

                    <FilterTabs activeTab={activeTab} onTabChange={handleTabChange} />

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

                    {!loading && !error && posts.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Chưa có bài đăng nào</p>
                        </div>
                    )}

                    {!loading && !error && posts.length > 0 && (
                        <div>
                            {posts.map((post) => (
                                <div key={post.postId} className="relative group">
                                    <PostCard 
                                        post={post} 
                                        onLike={handleLike}
                                        onPostClick={handlePostClick}
                                        isAuthenticated={isAuthenticated}
                                    />
                                    {isAuthenticated && currentUserId === post.author.userId && (
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleEditPost(post.postId)
                                                }}
                                                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit size={16} className="text-blue-600" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeletePost(post.postId)
                                                }}
                                                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
                                            </button>
                                        </div>
                                    )}
                                </div>
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

export default ForumInterface