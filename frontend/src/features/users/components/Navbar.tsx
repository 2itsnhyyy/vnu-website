import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { authService } from "../api/services/authService";

const Navbar = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(authService.getCurrentUser());

  const getAvatarUrl = (avatar: string | undefined) => {
    if (!avatar) return "https://ui-avatars.com/api/?name=User&background=random";
    
    if (avatar.includes("pexels.com/photo/")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=0D8ABC&color=fff`;
    }
    
    return avatar;
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    const baseClasses = "py-1 transition-all duration-200 border-b-2 text-sm";
    const activeClasses = "text-primary font-bold border-primary";
    const inactiveClasses = "text-gray-600 font-medium border-transparent hover:text-primary";
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/users/login");
    window.location.reload(); 
  };

  return (
    <nav className="bg-white flex justify-between items-center py-2 sticky top-0 z-50 shadow-sm border-b border-gray-100">
      
      {/* Logo */}
      <img
        className="w-32 cursor-pointer ml-10"
        src="/src/assets/logos/LogoChu.svg"
        alt="logo"
        onClick={() => navigate("/users")}
      />

      {/* Menu Links */}
      <ul className="hidden md:flex space-x-8 items-center">
        <li><NavLink to="/users" end className={getNavLinkClass}>Trang chủ</NavLink></li>
        <li><NavLink to="/users/maps" className={getNavLinkClass}>Bản đồ</NavLink></li>
        <li><NavLink to="/users/forum" className={getNavLinkClass}>Diễn đàn</NavLink></li>
        <li><NavLink to="/users/issues" className={getNavLinkClass}>Sự cố</NavLink></li>
        <li><NavLink to="/users/news" className={getNavLinkClass}>Tin tức</NavLink></li>
        <li><NavLink to="/users/contact" className={getNavLinkClass}>Liên hệ</NavLink></li>
      </ul>

      {/* User Section */}
      <div className="flex items-center gap-4 mr-10">
        {user ? (
          <div className="relative group">
            <div className="flex items-center gap-3 cursor-pointer">
              <span className="font-medium text-gray-700 hidden sm:block">
                Chào, {user.name}
              </span>
              <img
                className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                src={getAvatarUrl(user.avatar)}
                alt="profile"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                }}
              />
            </div>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 w-48 mt-2 py-2 bg-white border border-gray-100 rounded-lg shadow-xl invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">
              <button 
                onClick={() => navigate(`/users/${user.userId}`)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Trang cá nhân
              </button>
              <hr className="my-1 border-gray-100" />
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/users/register")}
            className="bg-primary text-white hover:bg-opacity-90 px-6 py-2 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
          >
            Đăng ký
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;