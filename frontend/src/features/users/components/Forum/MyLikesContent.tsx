import type React from "react"
import { useState, useEffect } from "react"
import { Pagination } from "./Pagination"
import authService from "../../api/services/authService"
import forumService from "../../api/services/forumService"
import type { Post, Comment } from "../../api/types/forumType"
import { PostCard } from "./PostCard"
import { formatTimeAgo, renderCommentContent } from "./utils/formatters"
import { ThumbsUp, MessageSquare } from "lucide-react"
import { Modal } from "./utils/modal"

interface LikedItem {
    type: 'post' | 'comment'
    data: Post | Comment
    timestamp: string
}

interface Props {
    navigate: any
    isAuthenticated: boolean
}

const MyLikesContent: React.FC<Props> = ({ navigate, isAuthenticated }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [likedItems, setLikedItems] = useState<LikedItem[]>([])
    const [allLikedItems, setAllLikedItems] = useState<LikedItem[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)

    // ===== Modal state =====
    const [modalOpen, setModalOpen] = useState(false)
    const [modalConfig, setModalConfig] = useState<{
        title?: string
        message: string
        type?: "info" | "success" | "error" | "warning" | "confirm"
        onConfirm?: () => void
    }>({
        message: "",
    })

    const openModal = (config: typeof modalConfig) => {
        setModalConfig(config)
        setModalOpen(true)
    }
    // =======================

    useEffect(() => {
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
            setCurrentUserId(currentUser.userId)
        }
    }, [])

    const fetchLikedItems = async () => {
        if (!currentUserId) return

        setLoading(true)
        setError(null)
        setLoadingProgress(0)
        
        try {
            const allLiked: LikedItem[] = []

            setLoadingProgress(10)
            const postsResponse = await forumService.getPosts({
                limit: 50,
                page: 1,
                sort: "newest",
            })

            setLoadingProgress(30)

            const likedPosts = postsResponse.posts.filter(post => post.liked)
            likedPosts.forEach(post => {
                allLiked.push({
                    type: 'post',
                    data: post,
                    timestamp: post.updatedAt
                })
            })

            const postsWithComments = postsResponse.posts.filter(p => p.commentsCount > 0)
            const totalPosts = postsWithComments.length
            
            for (let i = 0; i < totalPosts; i++) {
                const post = postsWithComments[i]
                
                try {
                    const commentsResponse = await forumService.getComments(post.postId, {
                        limit: 50,
                        page: 1,
                        sort: "newest",
                    })

                    const likedComments = commentsResponse.comments.filter(comment => comment.liked)
                    likedComments.forEach(comment => {
                        allLiked.push({
                            type: 'comment',
                            data: { ...comment, post } as any,
                            timestamp: comment.updatedAt
                        })
                    })

                    setLoadingProgress(30 + Math.floor((i + 1) / totalPosts * 60))
                } catch (err) {
                    console.error(`Error fetching comments for post ${post.postId}:`, err)
                }
            }

            setLoadingProgress(95)

            allLiked.sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )

            setAllLikedItems(allLiked)
            
            const itemsPerPage = 5
            setTotalPages(Math.ceil(allLiked.length / itemsPerPage))
            
            const paginatedItems = allLiked.slice(0, itemsPerPage)
            setLikedItems(paginatedItems)
            
            setLoadingProgress(100)
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tải nội dung đã thích')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (allLikedItems.length > 0) {
            const itemsPerPage = 5
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const paginatedItems = allLikedItems.slice(startIndex, endIndex)
            setLikedItems(paginatedItems)
        }
    }, [currentPage, allLikedItems])

    useEffect(() => {
        if (currentUserId) {
            fetchLikedItems()
        }
    }, [currentUserId])

    const handleLikePost = async (postId: number, isCurrentlyLiked: boolean) => {
        setLikedItems(likedItems.map(item => {
            if (item.type === 'post' && (item.data as Post).postId === postId) {
                return {
                    ...item,
                    data: {
                        ...item.data,
                        liked: !isCurrentlyLiked,
                        likesCount: isCurrentlyLiked ? (item.data as Post).likesCount - 1 : (item.data as Post).likesCount + 1
                    }
                }
            }
            return item
        }))

        try {
            if (isCurrentlyLiked) {
                await forumService.unlikePost(postId)
                const newAllItems = allLikedItems.filter(item => 
                    !(item.type === 'post' && (item.data as Post).postId === postId)
                )
                setAllLikedItems(newAllItems)
                setTotalPages(Math.ceil(newAllItems.length / 5))
            } else {
                await forumService.likePost(postId)
            }
        } catch (err: any) {
            openModal({
                title: "Lỗi",
                message: err.message || 'Có lỗi xảy ra',
                type: "error",
            })
            setLikedItems(likedItems.map(item => {
                if (item.type === 'post' && (item.data as Post).postId === postId) {
                    return {
                        ...item,
                        data: {
                            ...item.data,
                            liked: isCurrentlyLiked,
                            likesCount: isCurrentlyLiked ? (item.data as Post).likesCount + 1 : (item.data as Post).likesCount - 1
                        }
                    }
                }
                return item
            }))
        }
    }

    const handleLikeComment = async (commentId: number, isCurrentlyLiked: boolean) => {
        setLikedItems(likedItems.map(item => {
            if (item.type === 'comment' && (item.data as Comment).commentId === commentId) {
                return {
                    ...item,
                    data: {
                        ...item.data,
                        liked: !isCurrentlyLiked,
                        likesCount: isCurrentlyLiked ? (item.data as Comment).likesCount - 1 : (item.data as Comment).likesCount + 1
                    }
                }
            }
            return item
        }))

        try {
            if (isCurrentlyLiked) {
                await forumService.unlikeComment(commentId)
                const newAllItems = allLikedItems.filter(item => 
                    !(item.type === 'comment' && (item.data as Comment).commentId === commentId)
                )
                setAllLikedItems(newAllItems)
                setTotalPages(Math.ceil(newAllItems.length / 5))
            } else {
                await forumService.likeComment(commentId)
            }
        } catch (err: any) {
            openModal({
                title: "Lỗi",
                message: err.message || 'Có lỗi xảy ra',
                type: "error",
            })
            setLikedItems(likedItems.map(item => {
                if (item.type === 'comment' && (item.data as Comment).commentId === commentId) {
                    return {
                        ...item,
                        data: {
                            ...item.data,
                            liked: isCurrentlyLiked,
                            likesCount: isCurrentlyLiked ? (item.data as Comment).likesCount + 1 : (item.data as Comment).likesCount - 1
                        }
                    }
                }
                return item
            }))
        }
    }

    const handlePostClick = (postId: number) => {
        navigate.toPost(postId)
    }

    const handleCommentClick = (postId: number, commentId: number) => {
        navigate.toPost(postId)
        setTimeout(() => {
            const element = document.getElementById(`comment-${commentId}`)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }, 100)
    }

    return (
        <div className="max-w-5xl mx-auto px-12 pt-8 pb-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Lượt thích</h1>
            </div>

            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                    <p className="text-gray-600 mb-2">Đang tải...</p>
                    <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{loadingProgress}%</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {!loading && !error && likedItems.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-600">Bạn chưa thích nội dung nào</p>
                </div>
            )}

            {!loading && !error && likedItems.length > 0 && (
                <div className="space-y-4">
                    {likedItems.map((item, index) => (
                        item.type === 'post' ? (
                            <PostCard 
                                key={`post-${(item.data as Post).postId}`}
                                post={item.data as Post} 
                                onLike={handleLikePost}
                                onPostClick={handlePostClick}
                                isAuthenticated={isAuthenticated}
                            />
                        ) : (
                            <div 
                                key={`comment-${(item.data as Comment).commentId}`}
                                onClick={() => handleCommentClick((item.data as any).postId, (item.data as Comment).commentId)}
                                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm cursor-pointer"
                            >
                                {(item.data as any).post && (
                                    <div className="mb-3 pb-3 border-b border-gray-100">
                                        <p className="text-sm text-gray-500">Bình luận trong bài:</p>
                                        <h3 className="font-semibold text-gray-900 mt-1">{(item.data as any).post.title}</h3>
                                    </div>
                                )}
                                
                                <div className="flex items-start gap-4">
                                    <img
                                        src={(item.data as Comment).author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(item.data as Comment).author.name}`}
                                        alt={(item.data as Comment).author.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-gray-900">{(item.data as Comment).author.name}</h4>
                                            <span className="text-xs text-gray-500">{formatTimeAgo((item.data as Comment).createdAt)}</span>
                                        </div>
                                        <div className="text-gray-700 mb-3">
                                            {renderCommentContent((item.data as Comment).content)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleLikeComment((item.data as Comment).commentId, (item.data as Comment).liked)
                                                }}
                                                className="flex items-center gap-1 text-blue-600"
                                            >
                                                <ThumbsUp size={16} fill="currentColor" />
                                                {(item.data as Comment).likesCount}
                                            </button>
                                            {(item.data as Comment).commentsCount > 0 && (
                                                <span className="flex items-center gap-1 text-gray-500">
                                                    <MessageSquare size={16} />
                                                    {(item.data as Comment).commentsCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {!loading && totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                />
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
            />
        </div>
    )
}

export default MyLikesContent