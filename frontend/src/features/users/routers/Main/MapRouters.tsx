import Map from '../../pages/Main/Maps/Map';

const MapRouters = [
  {
    path: '/maps',
    element: <Map />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
];

export default MapRouters;