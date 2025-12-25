import type React from "react"
import { useState } from "react"
import { ThumbsUp, MessageSquare, Edit2, Trash2, X, Check } from "lucide-react"
import type { Comment } from "../../api/types/forumType"
import { formatTimeAgo, renderCommentContent } from "./utils/formatters"
import { CommentInput } from "./CommentInput"
import { ReplyCard } from "./ReplyCard"
import forumService from "../../api/services/forumService"
import authService from "../../api/services/authService"

interface CommentCardProps {
    comment: Comment
    onLike: (commentId: number, isLiked: boolean) => void
    onReply: (commentId: number, content: string) => Promise<void>
    onUpdate: (commentId: number, content: string) => void
    onDelete: (commentId: number) => void
    isAuthenticated: boolean
    postId: number
}

export const CommentCard: React.FC<CommentCardProps> = ({ 
    comment, 
    onLike, 
    onReply, 
    onUpdate,
    onDelete,
    isAuthenticated, 
    postId 
}) => {
    const [showReplyInput, setShowReplyInput] = useState(false)
    const [replies, setReplies] = useState<Comment[]>([])
    const [showReplies, setShowReplies] = useState(false)
    const [loadingReplies, setLoadingReplies] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)
    const [isUpdating, setIsUpdating] = useState(false)

    const currentUser = authService.getCurrentUser()
    // Fix: Use userId (matches API response)
    const isOwner = currentUser && Number(currentUser.userId) === Number(comment.author.userId)

    // Debug log - Remove after fixing
    console.log('CommentCard Debug:', {
        currentUserId: currentUser?.userId,
        commentAuthorId: comment.author.userId,
        isOwner,
        currentUserType: typeof currentUser?.userId,
        authorIdType: typeof comment.author.userId
    })

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
        const response = await forumService.getComments(postId, {
            limit: 50,
            page: 1,
            parent: comment.commentId,
            sort: "newest",
        })
        setReplies(response.comments)
        setShowReplies(true)
    }

    const handleUpdateReply = (replyId: number, content: string) => {
        setReplies(replies.map(reply =>
            reply.commentId === replyId
                ? { ...reply, content }
                : reply
        ))
    }

    const handleDeleteReply = (replyId: number) => {
        setReplies(replies.filter(reply => reply.commentId !== replyId))
    }

    const handleEdit = () => {
        setIsEditing(true)
        setEditContent(comment.content)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditContent(comment.content)
    }

    const handleSaveEdit = async () => {
        if (!editContent.trim() || editContent === comment.content) {
            setIsEditing(false)
            return
        }

        setIsUpdating(true)
        try {
            await forumService.updateComment(comment.commentId, { content: editContent })
            onUpdate(comment.commentId, editContent)
            setIsEditing(false)
        } catch (err: any) {
            alert(err.message || 'Không thể cập nhật bình luận')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
            return
        }

        try {
            await forumService.deleteComment(comment.commentId)
            onDelete(comment.commentId)
        } catch (err: any) {
            alert(err.message || 'Không thể xóa bình luận')
        }
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
                    {isOwner && !isEditing && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleEdit}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Chỉnh sửa"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Xóa"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="mb-4">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            disabled={isUpdating}
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <button
                                onClick={handleSaveEdit}
                                disabled={isUpdating || !editContent.trim()}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                <Check size={14} />
                                {isUpdating ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                                className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-sm rounded-lg transition-colors"
                            >
                                <X size={14} />
                                Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-700 mb-4 leading-relaxed">
                        {renderCommentContent(comment.content)}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLikeClick}
                        className={`flex items-center gap-1 text-sm ${
                            comment.liked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
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
                            onUpdate={handleUpdateReply}
                            onDelete={handleDeleteReply}
                            isAuthenticated={isAuthenticated}
                            postId={postId}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}