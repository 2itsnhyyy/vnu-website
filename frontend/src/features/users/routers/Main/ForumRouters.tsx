import Forum from '../../pages/Main/Forum/Forum';

const ForumRouters = [
  {
    path: '/forum',
    element: <Forum />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
];

export default ForumRouters;