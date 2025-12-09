import Problems from "../../pages/Problems";

const ProblemsRouters = [
  {
    path: "problems",
    element: <Problems />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
];

export default ProblemsRouters;
