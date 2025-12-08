import { Bell, ChevronRight } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Avatar + Info */}
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
            alt="Avatar"
            className="w-12 h-12 rounded-full"
          />

          <div>
            <p className="text-sm text-gray-600">
              Đại học Quốc Gia Thành phố Hồ Chí Minh
            </p>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-gray-800">Quản trị viên</h1>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Notification */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
