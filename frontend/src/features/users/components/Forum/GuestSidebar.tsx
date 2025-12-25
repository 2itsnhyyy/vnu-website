import type React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Search, Menu, Tag, User } from "lucide-react"

export const GuestSidebar: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path: string) => {
        if (path === '/users/forum' && location.pathname === '/users/forum') {
            return !location.search
        }
        return location.pathname + location.search === path
    }

    const handleNavigation = (path: string) => {
        navigate(path)
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

            <div>
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
        </div>
    )
}