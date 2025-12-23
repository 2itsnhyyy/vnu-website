import Forum from "../../pages/Forum";
import EditPost from "../../pages/Forum/EditPost";
import ViewPost from "../../pages/Forum/ViewPost";
import CreatePost from "../../pages/Forum/CreatePost";

const ForumRouters = [
  {
    path: "forum",
    element: <Forum />,
  },
  {
    path: "forum/edit/:id",
    element: <EditPost />,
  },
  {
    path: "forum/:id",
    element: <ViewPost />,
  },
  {
    path: "forum/add",
    element: <CreatePost />,
  },
];

export default ForumRouters;
