import { Bell, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import AuthService from "../../../users/api/services/authService";
import type { UserData } from "../../../users/api";

export default function Header() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    setUser(AuthService.getCurrentUser());
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={
              user?.avatar ??
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
            }
            alt="Avatar"
            className="w-12 h-12 rounded-full"
          />

          <div>
            <p className="text-sm text-gray-600">{user?.name ?? ""}</p>

            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-gray-800">Quản trị viên</h1>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
