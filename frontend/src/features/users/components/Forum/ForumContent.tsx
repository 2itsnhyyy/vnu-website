import type React from "react"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Pagination } from "./Pagination"
import { FilterTabs } from "./FilterTabs"
import { PostCard } from "./PostCard"
import { Modal } from "./utils/modal"
import forumService from "../../api/services/forumService"
import authService from "../../api/services/authService"
import type { Post } from "../../api/types/forumType"

interface Props {
    navigate: any
    filter: string | null
    isAuthenticated: boolean
}

const ForumContent: React.FC<Props> = ({ navigate, filter, isAuthenticated }) => {
    const [activeTab, setActiveTab] = useState<"newest" | "oldest" | "hottest">("newest")
    const [currentPage, setCurrentPage] = useState(1)
    const [posts, setPosts] = useState<Post[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    
    // Modal states
    const [modalState, setModalState] = useState<{
        isOpen: boolean
        type: "info" | "success" | "error" | "warning" | "confirm"
        title?: string
        message: string
        onConfirm?: () => void
    }>({
        isOpen: false,
        type: "info",
        message: ""
    })

    useEffect(() => {
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
            setCurrentUserId(currentUser.userId)
        }
    }, [])

    const showModal = (
        message: string, 
        type: "info" | "success" | "error" | "warning" | "confirm" = "info",
        title?: string,
        onConfirm?: () => void
    ) => {
        setModalState({ isOpen: true, type, message, title, onConfirm })
    }

    const closeModal = () => {
        setModalState({ ...modalState, isOpen: false })
    }

    const fetchPosts = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await forumService.getPosts({
                limit: 5,
                page: currentPage,
                sort: activeTab,
            })
            
            let filteredPosts = response.posts
            let calculatedTotalPages = response.pagination.totalPages
            
            // Apply client-side filtering
            if (filter === 'admin') {
                filteredPosts = response.posts.filter(post => post.author.role === 1)
                // Recalculate total pages based on filtered results
                const totalFilteredItems = filteredPosts.length
                calculatedTotalPages = totalFilteredItems > 0 ? Math.ceil(totalFilteredItems / 5) : 1
            } else if (filter === 'my-posts' && currentUserId) {
                filteredPosts = response.posts.filter(post => post.author.userId === currentUserId)
                // Recalculate total pages based on filtered results
                const totalFilteredItems = filteredPosts.length
                calculatedTotalPages = totalFilteredItems > 0 ? Math.ceil(totalFilteredItems / 5) : 1
            }
            
            setPosts(filteredPosts)
            setTotalPages(calculatedTotalPages)
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
            
            showModal(err.message || 'Có lỗi xảy ra', 'error', 'Lỗi')
            console.error('Error toggling like:', err)
        }
    }

    const handlePostClick = (postId: number) => {
        navigate.toPost(postId)
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab as "newest" | "oldest" | "hottest")
        setCurrentPage(1)
    }

    const handleCreatePost = () => {
        if (!isAuthenticated) {
            showModal("Bạn cần đăng nhập để tạo bài đăng", 'warning', 'Yêu cầu đăng nhập')
            return
        }
        navigate.toCreate()
    }

    const handleDeletePost = (postId: number) => {
        showModal(
            "Bạn có chắc chắn muốn xóa bài đăng này?",
            'confirm',
            'Xác nhận xóa',
            async () => {
                try {
                    await forumService.deletePost(postId)
                    setPosts(posts.filter(post => post.postId !== postId))
                    showModal("Xóa bài đăng thành công", 'success', 'Thành công')
                } catch (error: any) {
                    showModal(error.message || "Có lỗi xảy ra khi xóa bài đăng", 'error', 'Lỗi')
                    console.error("Error deleting post:", error)
                }
            }
        )
    }

    const getPageTitle = () => {
        if (filter === 'admin') return 'Bài đăng của Admin'
        if (filter === 'my-posts') return 'Bài đăng của bạn'
        return 'Các bài đăng'
    }

    const getEmptyMessage = () => {
        if (filter === 'admin') return 'Chưa có bài đăng nào từ Admin'
        if (filter === 'my-posts') return 'Bạn chưa có bài đăng nào'
        return 'Chưa có bài đăng nào'
    }

    return (
        <>
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
                            <PostCard 
                                key={post.postId}
                                post={post} 
                                onLike={handleLike}
                                onPostClick={handlePostClick}
                                onDelete={handleDeletePost}
                                isAuthenticated={isAuthenticated}
                            />
                        ))}
                    </div>
                )}

                {/* Only show pagination when there are posts and more than 1 page */}
                {!loading && !error && posts.length > 0 && (
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                    />
                )}
            </div>

            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
                onConfirm={modalState.onConfirm}
            />
        </>
    )
}

export default ForumContent