import type React from "react"
import { useSearchParams } from "react-router-dom"
import { Search, Menu, User, MessageSquare, ThumbsUp } from "lucide-react"

interface NavigateHelper {
    toList: (filter?: string) => void
    toReplies: () => void
    toLikes: () => void
    toMyPosts: () => void
}

interface Props {
    navigate: NavigateHelper
}

export const AuthenticatedSidebar: React.FC<Props> = ({ navigate }) => {
    const [searchParams] = useSearchParams()
    
    const view = searchParams.get('view') || 'list'
    const filter = searchParams.get('filter')

    const isActive = (checkView: string, checkFilter?: string) => {
        if (checkView === 'list' && !checkFilter) {
            return view === 'list' && !filter
        }
        if (checkView === 'list' && checkFilter) {
            return view === 'list' && filter === checkFilter
        }
        return view === checkView
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
                    onClick={() => navigate.toList()}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('list') 
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
                    onClick={() => navigate.toList('admin')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('list', 'admin')
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
                    onClick={() => navigate.toMyPosts()}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('list', 'my-posts')
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <MessageSquare size={20} />
                    Bài đăng của bạn
                </button>
                <button 
                    onClick={() => navigate.toReplies()}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('replies')
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <MessageSquare size={20} />
                    Câu trả lời
                </button>
                <button 
                    onClick={() => navigate.toLikes()}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('likes')
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

// GuestSidebar.tsx
export const GuestSidebar: React.FC<Props> = ({ navigate }) => {
    const [searchParams] = useSearchParams()
    
    const view = searchParams.get('view') || 'list'
    const filter = searchParams.get('filter')

    const isActive = (checkView: string, checkFilter?: string) => {
        if (checkView === 'list' && !checkFilter) {
            return view === 'list' && !filter
        }
        if (checkView === 'list' && checkFilter) {
            return view === 'list' && filter === checkFilter
        }
        return view === checkView
    }

    return (
        <div className="w-76 bg-white border-r border-gray-200 p-6">
            <div className="mb-6">
                <div className="flex items-center gap-3 text-gray-600 mb-4 bg-gray-50 px-4 py-3 rounded-lg">
                    <Search size={20} />
                    <input type="text" placeholder="Tìm kiếm" className="outline-none text-sm flex-1 bg-transparent" />
                </div>
            </div>

            <div className="mb-6">
                <div className="text-xs text-gray-500 mb-3 font-semibold">MENU</div>
                <button 
                    onClick={() => navigate.toList()}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('list') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <Menu size={20} />
                    Chủ đề
                </button>
            </div>

            <div>
                <button 
                    onClick={() => navigate.toList('admin')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive('list', 'admin')
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <User size={20} />
                    Admin đăng tải
                </button>
            </div>
        </div>
    )
}