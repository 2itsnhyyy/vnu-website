import News from "../../pages/News";
import EditNews from "../../pages/News/EditNews";
import ViewNews from "../../pages/News/ViewNews";

const NewsRouters = [
  {
    path: "news",
    element: <News />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
  {
    path: "news/edit/:id",
    element: <EditNews />,
  },
  {
    path: "news/:id",
    element: <ViewNews />,
  },
];

export default NewsRouters;
