import type React from "react"
import { useState } from "react"
import { Eye, MessageSquare, ThumbsUp } from "lucide-react"
import { GuestSidebar } from "./GuestSideBar"
import { RightSidebar } from "./RightSidebar"
import { Pagination } from "./Pagination"

// Types
interface Post {
    id: number
    author: string
    avatar: string
    timeAgo: string
    title: string
    content: string
    tags: string[]
    views: number
    comments: number
    likes: number
    isLiked: boolean
}

// Filter Tabs Component
const FilterTabs: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({
    activeTab,
    onTabChange,
}) => {
    const tabs = [
        { id: "newest", label: "Mới Nhất", icon: "🕐" },
        { id: "top", label: "Top", icon: "⬆" },
        { id: "unanswered", label: "Nổi Bật", icon: "💬" },
        { id: "answered", label: "Đã Đóng", icon: "✓" },
    ]

    return (
        <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 ${activeTab === tab.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    <span>{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    )
}

// Post Card Component
const PostCard: React.FC<{ post: Post; onLike: (id: number) => void }> = ({ post, onLike }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm">
            <div className="flex items-start gap-4">
                <img src={post.avatar || "/placeholder.svg"} alt={post.author} className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="font-semibold text-gray-900">{post.author}</h3>
                            <p className="text-xs text-gray-500">{post.timeAgo}</p>
                        </div>
                        <button
                            onClick={() => onLike(post.id)}
                            className={`p-2 rounded-full ${post.isLiked ? "text-blue-500" : "text-gray-400 hover:bg-gray-100"}`}
                        >
                            <ThumbsUp size={20} fill={post.isLiked ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.content}</p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {post.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Eye size={16} />
                                {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare size={16} />
                                {post.comments}
                            </span>
                            <span className="flex items-center gap-1">
                                <ThumbsUp size={16} />
                                {post.likes}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Main Forum Component
const ForumInterface: React.FC = () => {
    const [activeTab, setActiveTab] = useState("newest")
    const [currentPage, setCurrentPage] = useState(1)
    const [posts, setPosts] = useState<Post[]>([
        {
            id: 1,
            author: "Golanginya",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Golanginya",
            timeAgo: "5 phút trước",
            title: "Làm sao để vào trường UIT mà không cần thẻ sinh viên?",
            content:
                "Mình là một bạn nữ (độc thân) ở bên trường hàng xóm USSH ạ. Mình muốn qua bên UIT ăn cơm thử một hôm do nghe nói cơm ở đây ngon, nhưng nghe nói bên này cần phải có thẻ si...",
            tags: ["golang", "linux", "overflow"],
            views: 125,
            comments: 15,
            likes: 155,
            isLiked: false,
        },
        {
            id: 2,
            author: "Linuxoid",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linuxoid",
            timeAgo: "25 phút trước",
            title: "Mình theo data thì nên học ngôn ngữ nào ạ?",
            content:
                "Mình là một bạn nữ (độc thân) ở bên trường hàng xóm USSH ạ. Mình muốn qua bên UIT ăn cơm thử một hôm do nghe nói cơm ở đây ngon, nhưng nghe nói bên này cần phải có thẻ si...",
            tags: ["java", "javascript", "wtf"],
            views: 125,
            comments: 15,
            likes: 155,
            isLiked: false,
        },
        {
            id: 3,
            author: "AizhanMaratovna",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aizhan",
            timeAgo: "2 days ago",
            title: "Thông báo khai giảng tại hội trường Trần Chí Đạo",
            content:
                "Mình là một bạn nữ (độc thân) ở bên trường hàng xóm USSH ạ. Mình muốn qua bên UIT ăn cơm thử một hôm do nghe nói cơm ở đây ngon, nhưng nghe nói bên này cần phải có thẻ si...",
            tags: ["svelte", "javascript", "recommendations"],
            views: 125,
            comments: 15,
            likes: 155,
            isLiked: false,
        },
        {
            id: 4,
            author: "Lola",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lola",
            timeAgo: "2 days ago",
            title: "Mùi đó ăn là tại khi quân sự",
            content:
                "Mình là một bạn nữ (độc thân) ở bên trường hàng xóm USSH ạ. Mình muốn qua bên UIT ăn cơm thử một hôm do nghe nói cơm ở đây ngon, nhưng nghe nói bên này cần phải có thẻ si...",
            tags: ["golang", "linux", "overflow"],
            views: 125,
            comments: 15,
            likes: 155,
            isLiked: false,
        },
    ])

    const handleLike = (postId: number) => {
        setPosts(
            posts.map((post) =>
                post.id === postId
                    ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
                    : post,
            ),
        )
    }

    return (
        <div className="flex h-screen bg-white pt-8">
            <GuestSidebar />

            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-5xl mx-auto px-12 pt-8 pb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Các bài đăng</h1>

                    <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    <div>
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} onLike={handleLike} />
                        ))}
                    </div>

                    <Pagination currentPage={currentPage} totalPages={33} onPageChange={setCurrentPage} />
                </div>
            </div>

            <RightSidebar />
        </div>
    )
}

export default ForumInterface
