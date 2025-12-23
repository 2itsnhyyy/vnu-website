import { useCallback } from "react";
import { Link, useLocation } from "react-router";
import {
  MdOutlineDashboard,
  MdLocationPin,
  MdOutlineForum,
  MdOutlineLogout,
} from "react-icons/md";
import { FaRegBuilding, FaRegNewspaper } from "react-icons/fa6";
import { IoWarningOutline } from "react-icons/io5";
import { LuUsersRound } from "react-icons/lu";
import logo from "../../../../assets/logos/LogoChu.svg";
import { useSidebar } from "../../contexts/SidebarContext";
import { authService } from "../../../users/api";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
};

const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/users/login";
  };

  const basePath = "/admin";

  const navItems: NavItem[] = [
    {
      icon: <MdOutlineDashboard />,
      name: "Tổng quan",
      path: `${basePath}/`,
    },
    {
      icon: <MdLocationPin />,
      name: "Quản lý địa điểm",
      path: `${basePath}/places`,
    },
    {
      icon: <FaRegBuilding />,
      name: "Quản lý tòa nhà",
      path: `${basePath}/buildings`,
    },
    {
      icon: <MdOutlineForum />,
      name: "Quản lý Forum",
      path: `${basePath}/forum`,
    },
    {
      icon: <IoWarningOutline />,
      name: "Quản lý sự cố",
      path: `${basePath}/incidents`,
    },
    {
      icon: <FaRegNewspaper />,
      name: "Quản lý tin tức",
      path: `${basePath}/news`,
    },
    {
      icon: <LuUsersRound />,
      name: "Quản lý người dùng",
      path: `${basePath}/users`,
    },
    {
      icon: <MdOutlineLogout />,
      name: "Đăng xuất",
    },
  ];

  const isActive = useCallback(
    (path: string) => {
      return (
        location.pathname === path || location.pathname.startsWith(path + "/")
      );
    },
    [location.pathname]
  );

  return (
    <aside
      className={`
        fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 
        bg-white text-gray-900 h-screen 
        transition-all border-r border-gray-200 z-50
        items-center
        ${
          isExpanded || isMobileOpen
            ? "w-[250px]"
            : isHovered
            ? "w-[250px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to={basePath}>
          <img src={logo} alt="logo" className="w-[70%] ml-7" />
        </Link>
      </div>

      <nav className="flex flex-col gap-4">
        {navItems.map((item) =>
          item.name === "Đăng xuất" ? (
            <button
              key={item.name}
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-4 p-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            >
              <span>{item.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span>{item.name}</span>
              )}
            </button>
          ) : (
            <Link
              key={item.name}
              to={item.path!}
              className={`
        flex items-center gap-4 p-2 rounded-md
        ${isActive(item.path!) ? "bg-[#1D4ED8] text-white" : "text-gray-700"}
        transition-colors
      `}
            >
              <span>{item.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span>{item.name}</span>
              )}
            </Link>
          )
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
