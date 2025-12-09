import Dashboard from "../../pages/Dashboard";

const DashboardRouters = [
  {
    path: "",
    element: <Dashboard />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
];

export default DashboardRouters;
