import { Outlet } from 'react-router-dom';
import MainLayout from "../layouts/MainLayout";
import MainRouters from "./Main/index";
import AuthRouters from "./Auth/index";

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: MainRouters,
  },
  
  ...AuthRouters,
];

export default routes;