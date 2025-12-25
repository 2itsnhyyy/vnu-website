import Forum from "../../pages/Main/Forum/Forum";
import PostDetails from "../../pages/Main/Forum/PostDetails";
import CreatePost from "../../pages/Main/Forum/CreatePost";
import EditPost from "../../pages/Main/Forum/EditPost";
import MyReplies from "../../pages/Main/Forum/MyReplies";
import MyLikes from "../../pages/Main/Forum/MyLikes";

const ForumRouters = [
  {
    path: "forum",
    children: [
      { path: "", element: <Forum /> }, 
      { path: "posts/:postId", element: <PostDetails /> }, 
      { path: "create", element: <CreatePost /> },
      { path: "edit/:postId", element: <EditPost /> },
      { path: "my-replies", element: <MyReplies /> },
      { path: "my-likes", element: <MyLikes /> },
    ],
  },
];

export default ForumRouters;