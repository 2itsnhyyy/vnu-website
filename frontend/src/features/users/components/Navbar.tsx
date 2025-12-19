import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(false);

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = "py-1 transition-all duration-200 border-b-2";
    const activeClasses = "text-primary font-bold border-primary";
    const inactiveClasses =
      "text-text-main font-medium border-transparent hover:text-primary";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="bg-white flex justify-between items-center py-2 text-sm sticky top-0 z-150 shadow-sm border-b border-surface-dim">

      {/* Logo */}
      <img
        className="w-40 cursor-pointer ml-10"
        src="/src/assets/logos/LogoChu.svg"
        alt="logo"
        onClick={() => navigate("/users")}
      />

      {/* Menu Links */}
      <ul className="hidden md:flex space-x-10 items-center gap-5">
        <li>
          <NavLink to="/users" end className={getNavLinkClass}>
            Trang chủ
          </NavLink>
        </li>
        <li>
          <NavLink to="/users/maps" className={getNavLinkClass}>
            Bản đồ
          </NavLink>
        </li>
        <li>
          <NavLink to="/users/forum" className={getNavLinkClass}>
            Diễn đàn
          </NavLink>
        </li>
        <li>
          <NavLink to="/users/issues" className={getNavLinkClass}>
            Sự cố
          </NavLink>
        </li>
        <li>
          <NavLink to="/users/news" className={getNavLinkClass}>
            Tin tức
          </NavLink>
        </li>
        <li>
          <NavLink to="/users/contact" className={getNavLinkClass}>
            Liên hệ
          </NavLink>
        </li>
      </ul>

      {/* Button Action */}
      <div className="flex items-center space-x-5 gap-4 mr-10">
        {!token && (
          <button
            onClick={() => navigate("/users/register/common")}
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
