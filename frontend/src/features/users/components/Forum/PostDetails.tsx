import type React from "react"
import { useState } from "react"
import { ThumbsUp, MoreVertical, Send } from "lucide-react"
import { AuthenticatedSidebar } from "./AuthenticatedSidebar"
import { RightSidebar } from "./RightSidebar"
import { Pagination } from "./Pagination"

// Types
interface Comment {
    id: number
    author: string
    avatar: string
    timeAgo: string
    content: string
    likes: number
    dislikes: number
    isLiked: boolean
    isDisliked: boolean
    replies?: Reply[]
}

interface Reply {
    id: number
    author: string
    content: string
    timeAgo: string
    replyTo: string
}

// Post Content Component
const PostContent: React.FC = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Golanginya"
                        alt="Golanginya"
                        className="w-12 h-12 rounded-full"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900">@Golanginya</h3>
                        <p className="text-xs text-gray-500">12 tháng 11, 2023 19:35</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={20} className="text-gray-500" />
                </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cảnh báo kiến ba khoang ktx khu A</h1>

            <p className="text-gray-700 mb-6 leading-relaxed">
                Mình đang ngủ xong quay mặt qua cái thấy nguyên con kiến ba khoang đang rình rập mình từ phía phía trên đầu
                giường
            </p>

            <img
                src="https://images.unsplash.com/photo-1577896851905-dc2f2d1d4589?w=800&auto=format&fit=crop"
                alt="Kiến ba khoang"
                className="w-full max-w-md rounded-lg mb-6"
            />

            <p className="text-gray-700 mb-6">
                Các bạn tân sinh viên nào mới vào thì để ý nka. Đừng có đập mấy con này nó ra nọc độc á
            </p>

            <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Kiến ba khoang</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">KTX khu A</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">wtf</span>
            </div>
        </div>
    )
}

// Comment Input Component
const CommentInput: React.FC<{ onSubmit: (text: string) => void }> = ({ onSubmit }) => {
    const [comment, setComment] = useState("")

    const handleSubmit = () => {
        if (comment.trim()) {
            onSubmit(comment)
            setComment("")
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Trả lời</h3>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập câu trả lời của bạn"
                className="w-full border border-gray-300 rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
                <button
                    onClick={() => setComment("")}
                    className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                    <Send size={16} />
                    Gửi
                </button>
            </div>
        </div>
    )
}

// Comment Card Component
const CommentCard: React.FC<{ comment: Comment; onLike: (id: number) => void; onDislike: (id: number) => void }> = ({
    comment,
    onLike,
    onDislike,
}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <img src={comment.avatar || "/placeholder.svg"} alt={comment.author} className="w-10 h-10 rounded-full" />
                    <div>
                        <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                        <p className="text-xs text-gray-500">{comment.timeAgo}</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={18} className="text-gray-500" />
                </button>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">{comment.content}</p>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => onLike(comment.id)}
                    className={`flex items-center gap-1 text-sm ${comment.isLiked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"}`}
                >
                    <ThumbsUp size={16} fill={comment.isLiked ? "currentColor" : "none"} />
                    {comment.likes}
                </button>
                <button
                    onClick={() => onDislike(comment.id)}
                    className={`flex items-center gap-1 text-sm ${comment.isDisliked ? "text-red-600" : "text-gray-500 hover:text-red-600"}`}
                >
                    <ThumbsUp size={16} className="rotate-180" fill={comment.isDisliked ? "currentColor" : "none"} />
                    {comment.dislikes}
                </button>
                <button className="text-sm text-blue-600 hover:underline ml-2">💬 Ẩn trả lời (3)</button>
                <button className="text-sm text-blue-600 hover:underline ml-auto">Trả lời</button>
            </div>

            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-12 space-y-3">
                    {comment.replies.map((reply) => (
                        <div key={reply.id} className="border-l-2 border-blue-500 pl-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900">{reply.author}</span>
                                <span className="text-xs text-gray-500">{reply.timeAgo}</span>
                            </div>
                            <p className="text-sm text-gray-700">
                                <span className="text-blue-600">by @{reply.replyTo}</span>
                            </p>
                            <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                            <button className="text-xs text-blue-600 hover:underline mt-2">Trả lời</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Main Post Detail Component
const PostDetailPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            author: "@nkisan",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nkisan",
            timeAgo: "9 tháng 11, 2020 19:35",
            content: "Trống ơn thức\n\nBữa mình cũng bắt dc 2 đại ca",
            likes: 12,
            dislikes: 3,
            isLiked: false,
            isDisliked: false,
            replies: [
                {
                    id: 11,
                    author: "@nkisan",
                    content: "Rồi có ơn hong pà",
                    timeAgo: "9 tháng 11, 2020 19:36",
                    replyTo: "lazyReplyer",
                },
                {
                    id: 12,
                    author: "@lazyReplyer",
                    content: "máy con này thấy kinh ớm",
                    timeAgo: "9 tháng 11, 2020 19:37",
                    replyTo: "unkind",
                },
            ],
        },
        {
            id: 2,
            author: "@morgenshtern",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=morgenshtern",
            timeAgo: "12 November 2020 19:35",
            content:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ornare rutrum amet, a nunc mi lacinia in iaculis. Pharetra et integer nibh urna. Placerat at adipiscing nulla lectus vulputate massa, scelerisque. Netus nisl nulla placerat dignissim ipsum arcu.",
            likes: 256,
            dislikes: 43,
            isLiked: false,
            isDisliked: false,
        },
        {
            id: 3,
            author: "@kizaru",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kizaru",
            timeAgo: "12 November 2020 19:35",
            content: "Mi ac id faucibus laoreet. Nulla quis in interdum imperdiet. Lacus mollis massa netus.",
            likes: 1,
            dislikes: 0,
            isLiked: false,
            isDisliked: false,
        },
    ])

    const handleLike = (commentId: number) => {
        setComments(
            comments.map((comment) => {
                if (comment.id === commentId) {
                    if (comment.isLiked) {
                        return { ...comment, isLiked: false, likes: comment.likes - 1 }
                    } else {
                        return {
                            ...comment,
                            isLiked: true,
                            likes: comment.likes + 1,
                            isDisliked: false,
                            dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes,
                        }
                    }
                }
                return comment
            }),
        )
    }

    const handleDislike = (commentId: number) => {
        setComments(
            comments.map((comment) => {
                if (comment.id === commentId) {
                    if (comment.isDisliked) {
                        return { ...comment, isDisliked: false, dislikes: comment.dislikes - 1 }
                    } else {
                        return {
                            ...comment,
                            isDisliked: true,
                            dislikes: comment.dislikes + 1,
                            isLiked: false,
                            likes: comment.isLiked ? comment.likes - 1 : comment.likes,
                        }
                    }
                }
                return comment
            }),
        )
    }

    const handleSubmitComment = (text: string) => {
        const newComment: Comment = {
            id: Date.now(),
            author: "@you",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
            timeAgo: "Vừa xong",
            content: text,
            likes: 0,
            dislikes: 0,
            isLiked: false,
            isDisliked: false,
        }
        setComments([newComment, ...comments])
    }

    return (
        <div className="flex h-screen bg-white pt-8">
            <AuthenticatedSidebar />

            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-4xl mx-auto px-12 pt-8 pb-10">
                    <PostContent />

                    <CommentInput onSubmit={handleSubmitComment} />

                    <div>
                        {comments.map((comment) => (
                            <CommentCard key={comment.id} comment={comment} onLike={handleLike} onDislike={handleDislike} />
                        ))}
                    </div>

                    <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
                </div>
            </div>

            <RightSidebar />
        </div>
    )
}

export default PostDetailPage
