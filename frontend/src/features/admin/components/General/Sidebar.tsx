//ĐÂY LÀ SIDEBAR TƯỢNG TRƯNG, ĐỢI PNKI CODE XONG GẮN VÔ HIHI        /
//                                                                  /
//                                                                 /
////////////////////////////////////////////////////////////////////
import React, { useState } from "react";
import {
  Home,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

const navItems: NavItem[] = [
  { id: "home", label: "Dashboard", icon: <Home size={18} /> },
  { id: "team", label: "Team", icon: <Users size={18} /> },
  { id: "calendar", label: "Calendar", icon: <Calendar size={18} />, badge: 3 },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function Sidebar({}: {}) {
  const [active, setActive] = useState<string>("home");
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <aside
      className={`flex flex-col h-screen bg-white border-r transition-width duration-200 ease-in-out shadow-sm ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center rounded-md font-bold text-lg p-2 text-white transition-all ${
              collapsed ? "w-8 h-8" : "w-10 h-10"
            } bg-gradient-to-br from-indigo-500 to-violet-500`}
          >
            {/* simple logo mark */}
            <span className="select-none">ST</span>
          </div>
          {!collapsed && <span className="text-sm font-semibold">Sidebar</span>}
        </div>

        <button
          onClick={() => setCollapsed((s) => !s)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-1 py-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActive(item.id)}
                  className={`flex items-center w-full gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 focus:outline-none ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center justify-center min-w-[28px]">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {typeof item.badge === "number" && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div className="my-4 h-px bg-gray-100" />

        {/* Secondary area - example groups */}
        {!collapsed && (
          <div className="px-3 text-xs text-gray-400 uppercase tracking-wide mb-2">Projects</div>
        )}
        <ul className="px-1 space-y-2">
          <li>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 text-gray-600 text-sm" href="#">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              {!collapsed && <span>Project Aurora</span>}
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 text-gray-600 text-sm" href="#">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              {!collapsed && <span>Design System</span>}
            </a>
          </li>
        </ul>
      </nav>

      {/* Footer / Profile */}
      <div className="px-3 py-3 border-t">
        <div className="flex items-center gap-3">
          <div className="rounded-full w-10 h-10 bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">NT</div>
          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm font-medium">Nhật Trường</div>
              <div className="text-xs text-gray-400">Developer</div>
            </div>
          )}
          <button className="p-2 rounded hover:bg-gray-100" aria-label="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
