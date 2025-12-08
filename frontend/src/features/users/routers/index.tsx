// File: src/features/users/routers/index.tsx

import { Outlet } from 'react-router-dom';
import MainLayout from "../layouts/MainLayout"; // Import Layout vào đây
import MainRouters from "./Main/index"; // Import cái mảng bạn vừa sửa ở Bước 1
import AuthRouters from "./Auth/index"; // Các trang Login/Register

const routes = [
  {
    // Cấu hình Route CHA
    path: "/",
    element: <MainLayout />, // Layout chỉ khai báo 1 lần duy nhất ở đây
    children: MainRouters,   // Nhét toàn bộ các trang con vào lòng Layout
  },
  
  // Các trang Auth nằm ngoài Layout chính
  ...AuthRouters,
];

export default routes;