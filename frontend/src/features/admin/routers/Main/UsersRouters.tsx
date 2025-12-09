import Users from "../../pages/Users";
import ViewUser from "../../pages/Users/ViewUser";

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
  {
    path: "users/:id",
    element: <ViewUser />,
  },
];

export default UsersRouters;
