import News from "../../pages/Main/News/News";
import Detail from "../../components/News/Detail";

const NewsRouters = [
  {
    path: "news",
    children: [
      {
        index: true,        // /news
        element: <News />,
      },
      {
        path: ":id",        // /news/:id
        element: <Detail />,
      },
    ],
  },
];

export default NewsRouters;
