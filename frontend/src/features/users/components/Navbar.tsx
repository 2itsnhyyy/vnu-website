import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(false);

  // --- CẬP NHẬT PHẦN STYLE NÀY ---
  const getNavLinkClass = ({ isActive }) => {
    // Base styles: Thêm border-transparent để tránh bị nhảy layout khi hover/active
    const baseClasses = "py-1 transition-all duration-200 border-b-2";

    // KHI ACTIVE (Đang chọn):
    // - text-text-main: Màu đen xanh (theo theme của bạn)
    // - font-bold: In đậm (Hoặc dùng font-heavy nếu muốn đậm hơn nữa)
    // - border-text-main: Gạch chân màu đen (cho đồng bộ)
    const activeClasses = "text-primary font-bold border-primary";

    // KHI INACTIVE (Bình thường):
    // - text-text-main: Vẫn là màu đen (như bạn yêu cầu lúc trước)
    // - font-medium: Độ đậm vừa phải
    // - border-transparent: Ẩn gạch chân
    // - hover:text-primary: Rê chuột vào thì đổi màu xanh cho sinh động
    const inactiveClasses = "text-text-main font-medium border-transparent hover:text-primary";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };
  // -------------------------------

  return (
    <div className="bg-white flex justify-between items-center py-2 text-sm sticky top-0 z-50 shadow-sm border-b border-surface-dim">
      {/* Logo */}
      <img
        className="w-15 cursor-pointer ml-10"
        src="/src/assets/logos/LogoChu.svg"
        alt="logo"
      />

      {/* Menu Links */}
      <ul className="hidden md:flex space-x-10 items-center gap-5">
        <li>
          <NavLink to="/" className={getNavLinkClass}>
            Trang chủ
          </NavLink>
        </li>
        <li>
          <NavLink to="/maps" className={getNavLinkClass}>
            Bản đồ
          </NavLink>
        </li>
        <li>
          <NavLink to="/forum" className={getNavLinkClass}>
            Diễn đàn
          </NavLink>
        </li>
        <li>
          <NavLink to="/issues" className={getNavLinkClass}>
            Sự cố
          </NavLink>
        </li>
        <li>
          <NavLink to="/news" className={getNavLinkClass}>
            Tin tức
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={getNavLinkClass}>
            Liên hệ
          </NavLink>
        </li>
      </ul>

      {/* Button Action */}
      <div className="flex items-center space-x-5 gap-4 mr-10">
        {!token && (
          <button
            onClick={() => navigate("/register")}
            className="bg-primary text-white hover:bg-primary-light px-6 py-2 rounded-lg font-bold hidden md:block cursor-pointer transition-colors"
          >
            Đăng ký
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;