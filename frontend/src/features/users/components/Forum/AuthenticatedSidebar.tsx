import type React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Search, Menu, Tag, User, MessageSquare, ThumbsUp } from "lucide-react"

export const AuthenticatedSidebar: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path: string) => {
        // Check both path and query params
        if (path === '/users/forum' && location.pathname === '/users/forum') {
            return !location.search 
        }
        return location.pathname + location.search === path
    }

    const handleNavigation = (path: string) => {
        navigate(path)
    }

    return (
        <div className="w-72 bg-white border-r border-gray-200 p-6">
            <div className="mb-6">
                <div className="flex items-center gap-3 text-gray-600 mb-4 bg-gray-50 px-4 py-3 rounded-lg">
                    <Search size={20} />
                    <input type="text" placeholder="Tìm kiếm" className="outline-none text-sm flex-1 bg-transparent" />
                </div>
            </div>

            <div className="mb-6">
                <div className="text-xs text-gray-500 mb-3 font-semibold">MENU</div>
                <button 
                    onClick={() => handleNavigation('/users/forum')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('/users/forum') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <Menu size={20} />
                    Chủ đề
                </button>
            </div>

            <div className="mb-6">
                <button 
                    onClick={() => handleNavigation('/users/forum?filter=admin')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('/users/forum?filter=admin')
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <User size={20} />
                    Admin đăng tải
                </button>
            </div>

            <div className="border-t pt-6">
                <div className="text-xs text-gray-500 mb-3 font-semibold">CỦA BẠN</div>
                <button 
                    onClick={() => handleNavigation('/users/forum?filter=my-posts')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('/users/forum?filter=my-posts')
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <MessageSquare size={20} />
                    Bài đăng của bạn
                </button>
                <button 
                    onClick={() => handleNavigation('/users/forum/my-replies')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('/users/forum/my-replies')
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <MessageSquare size={20} />
                    Câu trả lời
                </button>
                <button 
                    onClick={() => handleNavigation('/users/forum/my-likes')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('/users/forum/my-likes')
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <ThumbsUp size={20} />
                    Lượt thích
                </button>
            </div>
        </div>
    )
}