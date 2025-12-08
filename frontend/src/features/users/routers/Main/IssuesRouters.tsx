import Issues from '../../pages/Main/Issues/Issues';

const IssuesRouters = [
  {
    path: '/issues',
    element: <Issues />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
];

export default IssuesRouters;