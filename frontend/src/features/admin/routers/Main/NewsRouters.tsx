import News from "../../pages/News";
import EditNews from "../../pages/News/EditNews";
import ViewNews from "../../pages/News/ViewNews";
import CreateNews from "../../pages/News/CreateNews";

const NewsRouters = [
  {
    path: "news",
    element: <News />,
  },
  {
    path: "news/edit/:id",
    element: <EditNews />,
  },
  {
    path: "news/:id",
    element: <ViewNews />,
  },
  {
    path: "news/add",
    element: <CreateNews />,
  },
];

export default NewsRouters;
