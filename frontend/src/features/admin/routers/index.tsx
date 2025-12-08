import MainLayout from "../layouts/MainLayout";
import MainRouters from "./Main";

const adminRoutes = [
  {
    path: "/admin",
    element: <MainLayout />,
    children: MainRouters,
  },
];

export default adminRoutes;
