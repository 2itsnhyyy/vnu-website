import News from "../../pages/Main/News";

const NewsRoutes = [
  {
    path: "news",
    element: <News />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
];

export default NewsRoutes;
