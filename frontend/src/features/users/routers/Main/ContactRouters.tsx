import Contact from '../../pages/Main/Contact';

const ContactRouters = [
  {
    path: '/contact',
    element: <Contact />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
];

export default ContactRouters;