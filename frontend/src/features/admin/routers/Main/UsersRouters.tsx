import Users from "../../pages/Users";
import ViewUser from "../../pages/Users/ViewUser";

const UsersRouters = [
  {
    path: "users",
    element: <Users />,
  },
  {
    path: "users/:id",
    element: <ViewUser />,
  },
];

export default UsersRouters;
