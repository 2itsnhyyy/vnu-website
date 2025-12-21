import MainLayout from "../layouts/MainLayout";
import MainRouters from "./Main";
import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { STORAGE_KEYS } from "../../users/api";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const rawUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (!user) {
    return <Navigate to="/users/login" replace />;
  }

  if (Number(user.role) !== 1) {
    return <Navigate to="/users" replace />;
  }

  return children;
};

const adminRoutes = [
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <MainLayout />
      </AdminRoute>
    ),
    children: MainRouters,
  },
];

export default adminRoutes;
