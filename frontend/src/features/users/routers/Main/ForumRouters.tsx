import Forum from "../../pages/Main/Forum/Forum";
import PostDetails from "../../pages/Main/Forum/PostDetails";
import CreatePost from "../../pages/Main/Forum/CreatePost";

const ForumRouters = [
  {
    path: "forum",
    children: [
      { path: "", element: <Forum /> },
      { path: "posts/:postId", element: <PostDetails /> }, 
      { path: "create", element: <CreatePost /> },
    ],
  },
];

export default ForumRouters;