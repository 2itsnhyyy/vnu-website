import type React from "react"
import { Star } from "lucide-react"

export const RightSidebar: React.FC = () => {
    return (
        <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-gray-700 mb-4">
                    <Star size={20} />
                    <h3 className="font-semibold">Các quy định</h3>
                </div>
                <ul className="space-y-2 text-sm text-blue-600">
                    <li className="hover:underline cursor-pointer">• Các luật lệ quan trọng khi tham gia Forum của MyVNU</li>
                    <li className="hover:underline cursor-pointer">• Tìm kiếm trợ giúp</li>
                </ul>
            </div>

            <div>
                <h3 className="font-semibold text-gray-700 mb-4">🔗 Các đường dẫn quan trọng</h3>
                <ul className="space-y-2 text-sm text-blue-600">
                    <li className="hover:underline cursor-pointer">• Facebook chính thức</li>
                    <li className="hover:underline cursor-pointer">• Instagram chính thức</li>
                    <li className="hover:underline cursor-pointer">• Twitter chính thức</li>
                </ul>
            </div>
        </div>
    )
}
