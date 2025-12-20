import type React from "react"
import { Search, Menu, Tag, User } from "lucide-react"

export const GuestSidebar: React.FC = () => {
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
                <button className="w-full flex items-center gap-3 bg-blue-50 text-blue-600 px-4 py-3 rounded-lg text-sm font-medium">
                    <Menu size={20} />
                    Chủ đề
                </button>
            </div>

            <div className="mb-6">
                <button className="w-full flex items-center gap-3 text-gray-700 px-4 py-3 rounded-lg text-sm hover:bg-gray-50 font-medium">
                    <Tag size={20} />
                    Tags
                </button>
            </div>

            <div>
                <button className="w-full flex items-center gap-3 text-gray-700 px-4 py-3 rounded-lg text-sm hover:bg-gray-50 font-medium">
                    <User size={20} />
                    Admin đăng tải
                </button>
            </div>
        </div>
    )
}
