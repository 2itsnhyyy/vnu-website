import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ThumbsUp, Send, ArrowLeft, MessageSquare } from "lucide-react"
import { AuthenticatedSidebar } from "./AuthenticatedSidebar"
import { RightSidebar } from "./RightSidebar"
import { Pagination } from "./Pagination"
import forumService from "../../api/services/forumService"
import type { Post, Comment } from "../../api/types/forumType"
import { STORAGE_KEYS } from "../../api/config"

// Helper function for time formatting
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

// Post Content Component
const PostContent: React.FC<{
    post: Post;
    onLike: () => void;
    isAuthenticated: boolean;
}> = ({ post, onLike, isAuthenticated }) => {
    const handleLikeClick = () => {
        if (!isAuthenticated) {
            alert('Bạn cần đăng nhập để thích bài viết')
            return
        }
        onLike()
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img
                        src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                        <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="prose max-w-none text-gray-700 mb-6 leading-relaxed">
                {post.contentMarkdown.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-3xl font-bold mt-6 mb-4">{line.substring(2)}</h1>
                    }
                    if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-2xl font-bold mt-5 mb-3">{line.substring(3)}</h2>
                    }
                    if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(4)}</h3>
                    }
                    if (line.trim() === '') {
                        return <br key={index} />
                    }
                    const boldRegex = /\*\*(.+?)\*\*/g
                    const parts = line.split(boldRegex)
                    return (
                        <p key={index} className="mb-2">
                            {parts.map((part, i) =>
                                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                            )}
                        </p>
                    )
                })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {post.author.role === 1 ? "Admin" : "User"}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{post.commentsCount} bình luận</span>
                    <button
                        onClick={handleLikeClick}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${post.liked
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } ${!isAuthenticated ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        title={isAuthenticated ? (post.liked ? "Bỏ thích" : "Thích") : "Đăng nhập để thích"}
                    >
                        <ThumbsUp size={18} fill={post.liked ? "currentColor" : "none"} />
                        <span className="text-sm font-medium">{post.likesCount}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

// Comment Input Component
const CommentInput: React.FC<{
    onSubmit: (text: string) => Promise<void>;
    isAuthenticated: boolean;
    parentId?: number | null;
    placeholder?: string;
    onCancel?: () => void;
}> = ({ onSubmit, isAuthenticated, parentId, placeholder = "Nhập câu trả lời của bạn", onCancel }) => {
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            alert('Bạn cần đăng nhập để bình luận')
            return
        }

        if (comment.trim()) {
            setIsSubmitting(true)
            try {
                await onSubmit(comment)
                setComment("")
                if (onCancel) onCancel()
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    const handleCancel = () => {
        setComment("")
        if (onCancel) onCancel()
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-xl p-4 ${parentId ? 'ml-12' : 'mb-6'} shadow-sm`}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {parentId ? "Trả lời bình luận" : "Bình luận"}
            </h3>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={!isAuthenticated || isSubmitting}
            />
            <div className="flex justify-end gap-3 mt-3">
                <button
                    onClick={handleCancel}
                    className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                    disabled={isSubmitting}
                >
                    Hủy
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    disabled={!isAuthenticated || isSubmitting || !comment.trim()}
                >
                    <Send size={14} />
                    {isSubmitting ? "Đang gửi..." : "Gửi"}
                </button>
            </div>
            {!isAuthenticated && (
                <p className="text-xs text-gray-500 mt-2">
                    Bạn cần <a href="/users/login" className="text-blue-500 hover:underline">đăng nhập</a> để bình luận
                </p>
            )}
        </div>
    )
}

// Reply Card Component (for nested replies)
const ReplyCard: React.FC<{
    reply: Comment;
    parentCommentId: number;
    onLike: (commentId: number, isLiked: boolean) => void;
    onReply: (parentId: number, content: string) => Promise<void>;
    isAuthenticated: boolean;
    postId: number;
}> = ({ reply, parentCommentId, onLike, onReply, isAuthenticated, postId }) => {
    const [showReplyInput, setShowReplyInput] = useState(false)

    const handleReplySubmit = async (content: string) => {
        // Always use the root comment as parent (2-level only)
        await onReply(parentCommentId, content)
        setShowReplyInput(false)
    }

    return (
        <>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                    <img
                        src={reply.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author.name}`}
                        alt={reply.author.name}
                        className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-sm text-gray-900">{reply.author.name}</h5>
                            <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{reply.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <button
                                onClick={() => onLike(reply.commentId, reply.liked)}
                                className={`flex items-center gap-1 text-xs ${reply.liked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                                    } ${!isAuthenticated ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled={!isAuthenticated}
                                title={isAuthenticated ? (reply.liked ? "Bỏ thích" : "Thích") : "Đăng nhập để thích"}
                            >
                                <ThumbsUp size={14} fill={reply.liked ? "currentColor" : "none"} />
                                {reply.likesCount}
                            </button>
                            <button
                                onClick={() => setShowReplyInput(!showReplyInput)}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                                disabled={!isAuthenticated}
                            >
                                <MessageSquare size={14} />
                                Trả lời
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showReplyInput && (
                <div className="mt-2">
                    <CommentInput
                        onSubmit={handleReplySubmit}
                        isAuthenticated={isAuthenticated}
                        parentId={parentCommentId}
                        placeholder={`Trả lời ${reply.author.name}...`}
                        onCancel={() => setShowReplyInput(false)}
                    />
                </div>
            )}
        </>
    )
}

// Comment Card Component with Replies
const CommentCard: React.FC<{
    comment: Comment;
    onLike: (commentId: number, isLiked: boolean) => void;
    onReply: (commentId: number, content: string) => Promise<void>;
    isAuthenticated: boolean;
    postId: number;
}> = ({ comment, onLike, onReply, isAuthenticated, postId }) => {
    const [showReplyInput, setShowReplyInput] = useState(false)
    const [replies, setReplies] = useState<Comment[]>([])
    const [showReplies, setShowReplies] = useState(false)
    const [loadingReplies, setLoadingReplies] = useState(false)

    const handleLikeClick = () => {
        if (!isAuthenticated) {
            alert('Bạn cần đăng nhập để thích bình luận')
            return
        }
        onLike(comment.commentId, comment.liked)
    }
    const handleLikeReply = async (replyId: number, isCurrentlyLiked: boolean) => {
        setReplies(replies.map(reply =>
            reply.commentId === replyId
                ? {
                    ...reply,
                    liked: !isCurrentlyLiked,
                    likesCount: isCurrentlyLiked ? reply.likesCount - 1 : reply.likesCount + 1
                }
                : reply
        ))

        try {
            if (isCurrentlyLiked) {
                await forumService.unlikeComment(replyId)
            } else {
                await forumService.likeComment(replyId)
            }
        } catch (err: any) {
            setReplies(replies.map(reply =>
                reply.commentId === replyId
                    ? {
                        ...reply,
                        liked: isCurrentlyLiked,
                        likesCount: isCurrentlyLiked ? reply.likesCount + 1 : reply.likesCount - 1
                    }
                    : reply
            ))
            alert(err.message || 'Có lỗi xảy ra')
        }
    }

    const loadReplies = async () => {
        if (replies.length > 0) {
            setShowReplies(!showReplies)
            return
        }

        setLoadingReplies(true)
        try {
            const response = await forumService.getComments(postId, {
                limit: 50,
                page: 1,
                parent: comment.commentId,
                sort: "newest",
            })
            setReplies(response.comments)
            setShowReplies(true)
        } catch (err) {
            console.error('Error loading replies:', err)
        } finally {
            setLoadingReplies(false)
        }
    }

    const handleReplySubmit = async (content: string) => {
        await onReply(comment.commentId, content)
        setShowReplyInput(false)
        // Reload replies to show the new one
        const response = await forumService.getComments(postId, {
            limit: 50,
            page: 1,
            parent: comment.commentId,
            sort: "newest",
        })
        setReplies(response.comments)
        setShowReplies(true)
    }

    return (
        <div className="mb-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <img
                            src={comment.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.name}`}
                            alt={comment.author.name}
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <h4 className="font-semibold text-gray-900">{comment.author.name}</h4>
                            <p className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</p>
                        </div>
                    </div>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLikeClick}
                        className={`flex items-center gap-1 text-sm ${comment.liked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                            } ${!isAuthenticated ? "cursor-not-allowed opacity-50" : ""}`}
                        title={isAuthenticated ? (comment.liked ? "Bỏ thích" : "Thích") : "Đăng nhập để thích"}
                    >
                        <ThumbsUp size={16} fill={comment.liked ? "currentColor" : "none"} />
                        {comment.likesCount}
                    </button>

                    <button
                        onClick={() => setShowReplyInput(!showReplyInput)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
                        disabled={!isAuthenticated}
                    >
                        <MessageSquare size={16} />
                        Trả lời
                    </button>

                    {comment.commentsCount > 0 && (
                        <button
                            onClick={loadReplies}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            {loadingReplies ? (
                                <span>Đang tải...</span>
                            ) : (
                                <>
                                    {showReplies ? '▼' : '▶'} {comment.commentsCount} câu trả lời
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {showReplyInput && (
                <div className="mt-2">
                    <CommentInput
                        onSubmit={handleReplySubmit}
                        isAuthenticated={isAuthenticated}
                        parentId={comment.commentId}
                        placeholder={`Trả lời ${comment.author.name}...`}
                        onCancel={() => setShowReplyInput(false)}
                    />
                </div>
            )}

            {showReplies && replies.length > 0 && (
                <div className="ml-12 mt-2 space-y-2">
                    {replies.map((reply) => (
                        <ReplyCard
                            key={reply.commentId}
                            reply={reply}
                            parentCommentId={comment.commentId}
                            onLike={handleLikeReply}
                            onReply={onReply}
                            isAuthenticated={isAuthenticated}
                            postId={postId}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// Main Post Detail Component
const PostDetailPage: React.FC = () => {
    const { postId } = useParams<{ postId: string }>()
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [post, setPost] = useState<Post | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
        setIsAuthenticated(!!token)
    }, [])

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true)
            setError(null)

            try {
                if (!postId) {
                    throw new Error('Post ID không hợp lệ')
                }

                const response = await forumService.getPostDetail(parseInt(postId))
                setPost(response.post)
            } catch (err: any) {
                setError(err.message || 'Không thể tải bài viết')
                console.error('Error loading post:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchPost()
    }, [postId])

    useEffect(() => {
        const fetchComments = async () => {
            if (!postId) return

            setCommentsLoading(true)
            try {
                const response = await forumService.getComments(parseInt(postId), {
                    limit: 10,
                    page: currentPage,
                    parent: null,
                    sort: "newest",
                })
                const rootComments = response.comments.filter(c => c.parent === null)
                setComments(rootComments)
            } catch (err: any) {
                console.error('Error loading comments:', err)
            } finally {
                setCommentsLoading(false)
            }
        }

        fetchComments()
    }, [postId, currentPage])

    const handleLikePost = async () => {
        if (!post) return

        const wasLiked = post.liked
        setPost({
            ...post,
            liked: !wasLiked,
            likesCount: wasLiked ? post.likesCount - 1 : post.likesCount + 1
        })

        try {
            if (wasLiked) {
                await forumService.unlikePost(post.postId)
            } else {
                await forumService.likePost(post.postId)
            }
        } catch (err: any) {
            setPost({
                ...post,
                liked: wasLiked,
                likesCount: wasLiked ? post.likesCount + 1 : post.likesCount - 1
            })
            alert(err.message || 'Có lỗi xảy ra')
        }
    }

    const handleLikeComment = async (commentId: number, isCurrentlyLiked: boolean) => {
        setComments(comments.map(comment =>
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
            setComments(comments.map(comment =>
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

    const handleSubmitComment = async (text: string) => {
        if (!postId) return

        try {
            const response = await forumService.createComment(parseInt(postId), {
                content: text,
            })
            if (response.comment.parent === null) {
                setComments([response.comment, ...comments])
            }

            if (post) {
                setPost({
                    ...post,
                    commentsCount: post.commentsCount + 1
                })
            }
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra khi tạo bình luận')
        }
    }

    const handleReplyComment = async (parentId: number, content: string) => {
        if (!postId) return

        try {
            await forumService.createComment(parseInt(postId), {
                content,
                parent: parentId,
            })

            // Update parent comment's reply count
            setComments(comments.map(comment =>
                comment.commentId === parentId
                    ? { ...comment, commentsCount: comment.commentsCount + 1 }
                    : comment
            ))

            if (post) {
                setPost({
                    ...post,
                    commentsCount: post.commentsCount + 1
                })
            }
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra khi trả lời bình luận')
        }
    }

    const handleBack = () => {
        navigate('/users/forum')
    }

    if (loading) {
        return (
            <div className="flex h-screen bg-white items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
                </div>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="flex h-screen bg-white items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Không tìm thấy bài viết'}</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-white pt-8">
            <AuthenticatedSidebar />

            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-4xl mx-auto px-12 pt-8 pb-10">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Quay lại</span>
                    </button>

                    <PostContent post={post} onLike={handleLikePost} isAuthenticated={isAuthenticated} />

                    <CommentInput
                        onSubmit={handleSubmitComment}
                        isAuthenticated={isAuthenticated}
                    />

                    {commentsLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-gray-600">Đang tải bình luận...</p>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                        </div>
                    ) : (
                        <div>
                            {comments.map((comment) => (
                                <CommentCard
                                    key={comment.commentId}
                                    comment={comment}
                                    onLike={handleLikeComment}
                                    onReply={handleReplyComment}
                                    isAuthenticated={isAuthenticated}
                                    postId={parseInt(postId!)}
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

export default PostDetailPage
