import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Pagination } from "./Pagination"
import { PostContent } from "./PostContent"
import { CommentInput } from "./CommentInput"
import { CommentCard } from "./CommentCard"
import forumService from "../../api/services/forumService"
import type { Post, Comment } from "../../api/types/forumType"
import { Modal } from "./utils/modal"

interface Props {
    postId: number
    navigate: any
    isAuthenticated: boolean
}

const PostDetailContent: React.FC<Props> = ({ postId, navigate, isAuthenticated }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [post, setPost] = useState<Post | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

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
        const fetchPost = async () => {
            setLoading(true)
            setError(null)

            try {
                if (!postId) {
                    throw new Error('Post ID không hợp lệ')
                }

                const response = await forumService.getPostDetail(postId)
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
                const response = await forumService.getComments(postId, {
                    limit: 5,
                    page: currentPage,
                    parent: null,
                    sort: "newest",
                })
                const rootComments = response.comments.filter(c => c.parent === null)
                setComments(rootComments)
                setTotalPages(response.pagination.totalPages)
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
            openModal({
                title: "Lỗi",
                message: err.message || 'Có lỗi xảy ra',
                type: "error",
            })
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
            openModal({
                title: "Lỗi",
                message: err.message || 'Có lỗi xảy ra',
                type: "error",
            })
        }
    }

    const handleSubmitComment = async (text: string) => {
        if (!postId) return

        try {
            const response = await forumService.createComment(postId, {
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
            openModal({
                title: "Lỗi",
                message: err.message || 'Có lỗi xảy ra khi tạo bình luận',
                type: "error",
            })
        }
    }

    const handleReplyComment = async (parentId: number, content: string) => {
        if (!postId) return

        try {
            await forumService.createComment(postId, {
                content,
                parent: parentId,
            })

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
            openModal({
                title: "Lỗi",
                message: err.message || 'Có lỗi xảy ra khi trả lời bình luận',
                type: "error",
            })
        }
    }

    const handleUpdateComment = (commentId: number, content: string) => {
        setComments(comments.map(comment =>
            comment.commentId === commentId
                ? { ...comment, content }
                : comment
        ))
    }

    const handleDeleteComment = (commentId: number) => {
        setComments(comments.filter(comment => comment.commentId !== commentId))
        
        if (post) {
            setPost({
                ...post,
                commentsCount: Math.max(0, post.commentsCount - 1)
            })
        }
    }

    const handleBack = () => {
        navigate.toList()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
                </div>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="flex items-center justify-center h-full">
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
                            onUpdate={handleUpdateComment}
                            onDelete={handleDeleteComment}
                            isAuthenticated={isAuthenticated}
                            postId={postId}
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

export default PostDetailContent