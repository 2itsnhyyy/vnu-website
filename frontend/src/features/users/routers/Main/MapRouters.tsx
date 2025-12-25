import Map from "../../pages/Main/Maps/Map";
import Map2 from "../../pages/Main/Maps/Map2";

const MapRouters = [
  {
    path: "maps",
    element: <Map2 />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
];

export default MapRouters;
