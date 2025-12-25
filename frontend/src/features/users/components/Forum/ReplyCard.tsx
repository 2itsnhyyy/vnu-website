import type React from "react"
import { useState } from "react"
import { ThumbsUp, MessageSquare, Edit2, Trash2, X, Check } from "lucide-react"
import type { Comment } from "../../api/types/forumType"
import { formatTimeAgo, renderCommentContent } from "./utils/formatters"
import { CommentInput } from "./CommentInput"
import forumService from "../../api/services/forumService"
import authService from "../../api/services/authService"

interface ReplyCardProps {
    reply: Comment
    parentCommentId: number
    onLike: (commentId: number, isLiked: boolean) => void
    onReply: (parentId: number, content: string) => Promise<void>
    onUpdate: (replyId: number, content: string) => void
    onDelete: (replyId: number) => void
    isAuthenticated: boolean
    postId: number
}

export const ReplyCard: React.FC<ReplyCardProps> = ({ 
    reply, 
    parentCommentId, 
    onLike, 
    onReply,
    onUpdate,
    onDelete,
    isAuthenticated, 
    postId 
}) => {
    const [showReplyInput, setShowReplyInput] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(reply.content)
    const [isUpdating, setIsUpdating] = useState(false)

    const currentUser = authService.getCurrentUser()
    // Fix: Use userId (matches API response)
    const isOwner = currentUser && Number(currentUser.userId) === Number(reply.author.userId)

    // Debug log - Remove after fixing
    console.log('ReplyCard Debug:', {
        currentUserId: currentUser?.userId,
        replyAuthorId: reply.author.userId,
        isOwner,
        currentUserType: typeof currentUser?.userId,
        authorIdType: typeof reply.author.userId
    })

    const handleReplySubmit = async (content: string) => {
        await onReply(parentCommentId, content)
        setShowReplyInput(false)
    }

    const handleEdit = () => {
        setIsEditing(true)
        setEditContent(reply.content)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditContent(reply.content)
    }

    const handleSaveEdit = async () => {
        if (!editContent.trim() || editContent === reply.content) {
            setIsEditing(false)
            return
        }

        setIsUpdating(true)
        try {
            await forumService.updateComment(reply.commentId, { content: editContent })
            onUpdate(reply.commentId, editContent)
            setIsEditing(false)
        } catch (err: any) {
            alert(err.message || 'Không thể cập nhật bình luận')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa câu trả lời này?')) {
            return
        }

        try {
            await forumService.deleteComment(reply.commentId)
            onDelete(reply.commentId)
        } catch (err: any) {
            alert(err.message || 'Không thể xóa câu trả lời')
        }
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
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <h5 className="font-semibold text-sm text-gray-900">{reply.author.name}</h5>
                                <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                            </div>
                            {isOwner && !isEditing && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handleEdit}
                                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Xóa"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {isEditing ? (
                            <div className="mt-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    disabled={isUpdating}
                                />
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isUpdating || !editContent.trim()}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Check size={12} />
                                        {isUpdating ? 'Đang lưu...' : 'Lưu'}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isUpdating}
                                        className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 text-xs rounded transition-colors"
                                    >
                                        <X size={12} />
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-gray-700 text-sm mt-1">
                                    {renderCommentContent(reply.content)}
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <button
                                        onClick={() => onLike(reply.commentId, reply.liked)}
                                        className={`flex items-center gap-1 text-xs ${
                                            reply.liked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
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
                            </>
                        )}
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