import Users from "../../pages/Main/Users";

const UsersRoutes = [
  {
    path: "users",
    element: <Users />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
];

export default UsersRoutes;
