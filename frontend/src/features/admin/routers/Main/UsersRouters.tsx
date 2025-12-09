import Users from "../../pages/Users";
const UsersRouters = [
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

export default UsersRouters;
