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
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
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
        try {
            // Get all posts first
            const postsResponse = await forumService.getPosts({
                limit: 100,
                page: 1,
                sort: "newest",
            })

            const allComments: CommentWithPost[] = []

            // Fetch comments for each post
            for (const post of postsResponse.posts) {
                try {
                    const commentsResponse = await forumService.getComments(post.postId, {
                        limit: 100,
                        page: 1,
                        sort: "newest",
                    })

                    // Filter only current user's comments
                    const userComments = commentsResponse.comments
                        .filter(comment => comment.author.userId === currentUserId)
                        .map(comment => ({ ...comment, post }))

                    allComments.push(...userComments)
                } catch (err) {
                    console.error(`Error fetching comments for post ${post.postId}:`, err)
                }
            }

            // Sort by newest
            allComments.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )

            // Paginate
            const itemsPerPage = 10
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const paginatedComments = allComments.slice(startIndex, endIndex)

            setComments(paginatedComments)
            setTotalPages(Math.ceil(allComments.length / itemsPerPage))
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tải câu trả lời')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMyComments()
    }, [currentPage, currentUserId])

    const handleCommentClick = (postId: number, commentId: number) => {
        navigate(`/users/forum/posts/${postId}#comment-${commentId}`)
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
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-gray-600">Đang tải...</p>
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
                                            <h3 className="font-semibold text-gray-900 mt-1">{comment.post.title}</h3>
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
                                            <div className="text-gray-700 mb-3">
                                                {renderCommentContent(comment.content)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <ThumbsUp size={16} />
                                                    {comment.likesCount}
                                                </span>
                                                {comment.commentsCount > 0 && (
                                                    <span className="flex items-center gap-1">
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

export default MyRepliesPage