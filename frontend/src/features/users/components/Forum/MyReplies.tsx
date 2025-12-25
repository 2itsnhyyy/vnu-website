import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthenticatedSidebar } from "./AuthenticatedSidebar"
import { RightSidebar } from "./RightSidebar"
import { Pagination } from "./Pagination"
import authService from "../../api/services/authService"
import forumService from "../../api/services/forumService"
import type { Comment, Post } from "../../api/types/forumType"
import { STORAGE_KEYS } from "../../api/config"
import { formatTimeAgo, renderCommentContent } from "./utils/formatters"
import { ThumbsUp, MessageSquare } from "lucide-react"

interface CommentWithPost extends Comment {
    post?: Post
}

const MyRepliesPage: React.FC = () => {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [comments, setComments] = useState<CommentWithPost[]>([])
    const [allComments, setAllComments] = useState<CommentWithPost[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [loadingProgress, setLoadingProgress] = useState(0)
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

    const fetchMyComments = async () => {
        if (!currentUserId) return

        setLoading(true)
        setError(null)
        setLoadingProgress(0)
        
        try {
            const myComments: CommentWithPost[] = []

            // Fetch posts (optimized: only 50 most recent)
            setLoadingProgress(10)
            const postsResponse = await forumService.getPosts({
                limit: 50,
                page: 1,
                sort: "newest",
            })

            setLoadingProgress(30)

            // Only process posts with comments
            const postsWithComments = postsResponse.posts.filter(p => p.commentsCount > 0)
            const totalPosts = postsWithComments.length

            for (let i = 0; i < totalPosts; i++) {
                const post = postsWithComments[i]
                
                try {
                    // Fetch only first 50 comments per post
                    const commentsResponse = await forumService.getComments(post.postId, {
                        limit: 50,
                        page: 1,
                        sort: "newest",
                    })

                    // Filter user's root comments
                    const userComments = commentsResponse.comments
                        .filter(comment => comment.author.userId === currentUserId)
                        .map(comment => ({ ...comment, post }))

                    myComments.push(...userComments)

                    // Fetch replies only for comments that have them
                    const commentsWithReplies = commentsResponse.comments.filter(c => c.commentsCount > 0)
                    
                    for (const comment of commentsWithReplies) {
                        try {
                            const repliesResponse = await forumService.getComments(post.postId, {
                                limit: 30,
                                page: 1,
                                parent: comment.commentId,
                                sort: "newest",
                            })

                            const userReplies = repliesResponse.comments
                                .filter(reply => reply.author.userId === currentUserId)
                                .map(reply => ({ ...reply, post }))

                            myComments.push(...userReplies)
                        } catch (err) {
                            console.error(`Error fetching replies for comment ${comment.commentId}:`, err)
                        }
                    }

                    // Update progress
                    setLoadingProgress(30 + Math.floor((i + 1) / totalPosts * 60))
                } catch (err) {
                    console.error(`Error fetching comments for post ${post.postId}:`, err)
                }
            }

            setLoadingProgress(95)

            // Sort by newest
            myComments.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )

            setAllComments(myComments)

            // Calculate pagination
            const itemsPerPage = 10
            setTotalPages(Math.ceil(myComments.length / itemsPerPage))
            
            // Set first page
            const paginatedComments = myComments.slice(0, itemsPerPage)
            setComments(paginatedComments)
            
            setLoadingProgress(100)
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tải câu trả lời')
        } finally {
            setLoading(false)
        }
    }

    // Pagination from cached data
    useEffect(() => {
        if (allComments.length > 0) {
            const itemsPerPage = 10
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const paginatedComments = allComments.slice(startIndex, endIndex)
            setComments(paginatedComments)
        }
    }, [currentPage, allComments])

    useEffect(() => {
        if (currentUserId) {
            fetchMyComments()
        }
    }, [currentUserId])

    const handleCommentClick = (postId: number, commentId: number) => {
        navigate(`/users/forum/posts/${postId}#comment-${commentId}`)
    }

    const handleLikeComment = async (commentId: number, isCurrentlyLiked: boolean) => {
        // Optimistic update in current page
        setComments(comments.map(comment =>
            comment.commentId === commentId
                ? {
                    ...comment,
                    liked: !isCurrentlyLiked,
                    likesCount: isCurrentlyLiked ? comment.likesCount - 1 : comment.likesCount + 1
                }
                : comment
        ))

        // Update in all cached comments
        setAllComments(allComments.map(comment =>
            comment.commentId === commentId
                ? {
                    ...comment,
                    liked: !isCurrentlyLiked,
                    likesCount: isCurrentlyLiked ? comment.likesCount - 1 : comment.likesCount + 1
                }
                : comment
        ))

        try {
            if (isCurrentlyLiked) {
                await forumService.unlikeComment(commentId)
            } else {
                await forumService.likeComment(commentId)
            }
        } catch (err: any) {
            // Revert on error
            setComments(comments.map(comment =>
                comment.commentId === commentId
                    ? {
                        ...comment,
                        liked: isCurrentlyLiked,
                        likesCount: isCurrentlyLiked ? comment.likesCount + 1 : comment.likesCount - 1
                    }
                    : comment
            ))
            setAllComments(allComments.map(comment =>
                comment.commentId === commentId
                    ? {
                        ...comment,
                        liked: isCurrentlyLiked,
                        likesCount: isCurrentlyLiked ? comment.likesCount + 1 : comment.likesCount - 1
                    }
                    : comment
            ))
            alert(err.message || 'Có lỗi xảy ra')
        }
    }

    return (
        <div className="flex h-screen bg-white pt-8">
            <AuthenticatedSidebar />

            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-5xl mx-auto px-12 pt-8 pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Câu trả lời của bạn</h1>
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

                    {!loading && !error && comments.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Bạn chưa có câu trả lời nào</p>
                        </div>
                    )}

                    {!loading && !error && comments.length > 0 && (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div 
                                    key={comment.commentId}
                                    onClick={() => handleCommentClick(comment.postId, comment.commentId)}
                                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm cursor-pointer"
                                >
                                    {comment.post && (
                                        <div className="mb-3 pb-3 border-b border-gray-100">
                                            <p className="text-sm text-gray-500">Bình luận trong bài:</p>
                                            <h3 className="font-semibold text-gray-900 mt-1 hover:text-blue-600 transition-colors">
                                                {comment.post.title}
                                            </h3>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={comment.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.name}`}
                                            alt={comment.author.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-gray-900">{comment.author.name}</h4>
                                                <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                                            </div>
                                            <div className="text-gray-700 mb-3 leading-relaxed">
                                                {renderCommentContent(comment.content)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleLikeComment(comment.commentId, comment.liked)
                                                    }}
                                                    className={`flex items-center gap-1 ${
                                                        comment.liked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                                                    }`}
                                                >
                                                    <ThumbsUp size={16} fill={comment.liked ? "currentColor" : "none"} />
                                                    {comment.likesCount}
                                                </button>
                                                {comment.commentsCount > 0 && (
                                                    <span className="flex items-center gap-1 text-gray-500">
                                                        <MessageSquare size={16} />
                                                        {comment.commentsCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                </div>
            </div>

            <RightSidebar />
        </div>
    )
}

export default MyRepliesPage