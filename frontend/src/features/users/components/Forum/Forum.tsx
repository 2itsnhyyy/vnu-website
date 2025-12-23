import type React from "react"
import { useState, useEffect } from "react"
import { Eye, MessageSquare, ThumbsUp } from "lucide-react"
import { GuestSidebar } from "./GuestSidebar"
import { RightSidebar } from "./RightSidebar"
import { Pagination } from "./Pagination"
import forumService from "../../api/services/forumService"
import type { Post } from "../../api/types/forumType"
import { STORAGE_KEYS } from "../../api/config"

// Filter Tabs Component
const FilterTabs: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({
    activeTab,
    onTabChange,
}) => {
    const tabs = [
        { id: "newest", label: "Mới Nhất", icon: "🕒" },
        { id: "top", label: "Top", icon: "⬆️" },
        { id: "unanswered", label: "Nổi Bật", icon: "💬" },
        { id: "answered", label: "Đã Đóng", icon: "✔️" },
    ]

    return (
        <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 ${activeTab === tab.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    <span>{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    )
}

// Post Card Component
const PostCard: React.FC<{ 
    post: Post; 
    onLike: (id: number, isLiked: boolean) => void;
    isAuthenticated: boolean;
}> = ({ post, onLike, isAuthenticated }) => {
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins} phút trước`
        if (diffHours < 24) return `${diffHours} giờ trước`
        if (diffDays === 1) return "1 ngày trước"
        if (diffDays < 7) return `${diffDays} ngày trước`
        return date.toLocaleDateString('vi-VN')
    }

    // Extract plain text from markdown for preview
    const getPlainText = (markdown: string) => {
        return markdown
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/\[(.+?)\]\(.+?\)/g, '$1')
            .trim()
    }

    const handleLikeClick = () => {
        if (!isAuthenticated) {
            alert('Bạn cần đăng nhập để thích bài viết')
            return
        }
        onLike(post.postId, post.liked)
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm">
            <div className="flex items-start gap-4">
                <img 
                    src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`} 
                    alt={post.author.name} 
                    className="w-12 h-12 rounded-full" 
                />
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                            <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                        </div>
                        <button
                            onClick={handleLikeClick}
                            className={`p-2 rounded-full transition-colors ${
                                post.liked 
                                    ? "text-blue-500 bg-blue-50" 
                                    : "text-gray-400 hover:bg-gray-100"
                            } ${!isAuthenticated ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                            title={isAuthenticated ? (post.liked ? "Bỏ thích" : "Thích") : "Đăng nhập để thích"}
                        >
                            <ThumbsUp size={20} fill={post.liked ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{getPlainText(post.contentMarkdown)}</p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {post.author.role === 1 ? "Admin" : "User"}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Eye size={16} />
                                0
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare size={16} />
                                {post.commentsCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <ThumbsUp size={16} />
                                {post.likesCount}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Main Forum Component
const ForumInterface: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"newest" | "top" | "unanswered" | "answered">("newest")
    const [currentPage, setCurrentPage] = useState(1)
    const [posts, setPosts] = useState<Post[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Check authentication status
    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
        setIsAuthenticated(!!token)
    }, [])

    // Fetch posts
    useEffect(() => {
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

        fetchPosts()
    }, [currentPage, activeTab])

    const handleLike = async (postId: number, isCurrentlyLiked: boolean) => {
        // Optimistic update
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
            // Revert optimistic update on error
            setPosts(posts.map(post =>
                post.postId === postId
                    ? {
                        ...post,
                        liked: isCurrentlyLiked,
                        likesCount: isCurrentlyLiked ? post.likesCount + 1 : post.likesCount - 1
                    }
                    : post
            ))
            
            // Show error message
            alert(err.message || 'Có lỗi xảy ra')
            console.error('Error toggling like:', err)
        }
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab as "newest" | "top" | "unanswered" | "answered")
        setCurrentPage(1)
    }

    return (
        <div className="flex h-screen bg-white pt-8">
            <GuestSidebar />

            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-5xl mx-auto px-12 pt-8 pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Các bài đăng</h1>
                        {!isAuthenticated && (
                            <div className="text-sm text-gray-500">
                                <a href="/users/login" className="text-blue-500 hover:underline">
                                    Đăng nhập
                                </a>
                                {" "}để thích bài viết
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
                                <PostCard 
                                    key={post.postId} 
                                    post={post} 
                                    onLike={handleLike}
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

export default ForumInterface