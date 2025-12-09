import Forum from "../../pages/Forum";
import EditPost from "../../pages/Forum/EditPost";

const ForumRouters = [
  {
    path: "forum",
    element: <Forum />,
    // children: [{ path: "edit/1", element: <EditPost /> }],
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
  {
    path: "forum/edit/:id",
    element: <EditPost />,
  },
];

export default ForumRouters;
