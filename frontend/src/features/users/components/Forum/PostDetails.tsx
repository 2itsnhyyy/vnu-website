import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { AuthenticatedSidebar } from "./AuthenticatedSidebar"
import { GuestSidebar } from "./GuestSidebar"
import { RightSidebar } from "./RightSidebar"
import { Pagination } from "./Pagination"
import { PostContent } from "./PostContent"
import { CommentInput } from "./CommentInput"
import { CommentCard } from "./CommentCard"
import forumService from "../../api/services/forumService"
import type { Post, Comment } from "../../api/types/forumType"
import { STORAGE_KEYS } from "../../api/config"

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
            {isAuthenticated ? <AuthenticatedSidebar /> : <GuestSidebar />}

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
                                    onUpdate={handleUpdateComment}
                                    onDelete={handleDeleteComment}
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