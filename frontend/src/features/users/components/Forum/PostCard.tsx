import type React from "react"
import { useState } from "react"
import { MessageSquare, ThumbsUp, Edit2, Trash2 } from "lucide-react"
import type { Post } from "../../api/types/forumType"
import { formatTimeAgo, getPlainText } from "./utils/formatters"
import authService from "../../api/services/authService"
import forumService from "../../api/services/forumService"
import { useNavigate } from "react-router-dom"
import { Modal } from "./utils/modal"

interface PostCardProps {
    post: Post
    onLike: (id: number, isLiked: boolean) => void
    onPostClick: (postId: number) => void
    onDelete?: (postId: number) => void
    onUpdate?: (postId: number, title: string, contentMarkdown: string) => void
    isAuthenticated: boolean
}

export const PostCard: React.FC<PostCardProps> = ({ 
    post, 
    onLike, 
    onPostClick, 
    onDelete,
    onUpdate,
    isAuthenticated 
}) => {
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(post.title)
    const [editContent, setEditContent] = useState(post.contentMarkdown)
    const [isUpdating, setIsUpdating] = useState(false)
    
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

    const currentUser = authService.getCurrentUser()
    const isOwner = currentUser && Number(currentUser.userId) === Number(post.author.userId)

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

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!isAuthenticated) {
            showModal('Bạn cần đăng nhập để thích bài viết', 'warning', 'Yêu cầu đăng nhập')
            return
        }
        onLike(post.postId, post.liked)
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        // FIX: Sử dụng query parameters thay vì route parameters
        navigate(`/users/forum?view=edit&postId=${post.postId}`)
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        
        showModal(
            'Bạn có chắc chắn muốn xóa bài đăng này?',
            'confirm',
            'Xác nhận xóa',
            async () => {
                try {
                    await forumService.deletePost(post.postId)
                    if (onDelete) {
                        onDelete(post.postId)
                    }
                    showModal('Xóa bài đăng thành công!', 'success', 'Thành công')
                } catch (err: any) {
                    showModal(err.message || 'Không thể xóa bài đăng', 'error', 'Lỗi')
                }
            }
        )
    }

    const handleCardClick = () => {
        if (!isEditing) {
            onPostClick(post.postId)
        }
    }

    return (
        <>
            <div 
                onClick={handleCardClick}
                className="bg-white border border-gray-200 rounded-xl p-6 mb-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm cursor-pointer"
            >
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
                            <div className="flex items-center gap-2">
                                {isOwner && (
                                    <>
                                        <button
                                            onClick={handleEdit}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
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
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                            {post.title}
                        </h2>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {getPlainText(post.contentMarkdown)}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {post.author.role === 1 ? "Admin" : "User"}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
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