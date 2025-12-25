import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { Plus, Edit, Trash2 } from "lucide-react"
import { GuestSidebar } from "./GuestSidebar"
import { AuthenticatedSidebar } from "./AuthenticatedSidebar"
import { RightSidebar } from "./RightSidebar"
import { Pagination } from "./Pagination"
import { FilterTabs } from "./FilterTabs"
import { PostCard } from "./PostCard"
import forumService from "../../api/services/forumService"
import authService from "../../api/services/authService"
import type { Post } from "../../api/types/forumType"
import { STORAGE_KEYS } from "../../api/config"

const ForumInterface: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const filter = searchParams.get('filter') // 'admin', 'my-posts', or null
    
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
        setIsAuthenticated(!!token)
        
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
            setCurrentUserId(currentUser.userId)
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
            
            let filteredPosts = response.posts
            
            // Apply filter based on query param
            if (filter === 'admin') {
                filteredPosts = response.posts.filter(post => post.author.role === 1)
            } else if (filter === 'my-posts' && currentUserId) {
                filteredPosts = response.posts.filter(post => post.author.userId === currentUserId)
            }
            
            setPosts(filteredPosts)
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
    }, [currentPage, activeTab, filter, currentUserId])

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

    // Get page title based on filter
    const getPageTitle = () => {
        if (filter === 'admin') return 'Bài đăng của Admin'
        if (filter === 'my-posts') return 'Bài đăng của bạn'
        return 'Các bài đăng'
    }

    // Get empty message based on filter
    const getEmptyMessage = () => {
        if (filter === 'admin') return 'Chưa có bài đăng nào từ Admin'
        if (filter === 'my-posts') return 'Bạn chưa có bài đăng nào'
        return 'Chưa có bài đăng nào'
    }

    return (
        <div className="flex h-screen bg-white pt-8">
            {isAuthenticated ? <AuthenticatedSidebar /> : <GuestSidebar />}

            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-5xl mx-auto px-12 pt-8 pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
                        {isAuthenticated && !filter && (
                            <button
                                onClick={handleCreatePost}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={20} />
                                Đăng bài của bạn
                            </button>
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
                            <p className="text-gray-600">{getEmptyMessage()}</p>
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
                                        onDelete={handleDeletePost}
                                        isAuthenticated={isAuthenticated}
                                    />
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