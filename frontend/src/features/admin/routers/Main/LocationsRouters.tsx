import { Locations } from "../../pages/Main/Locations";

const LocationsRouters = [
  {
    path: "locations",
    element: <Locations />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
];

export default LocationsRouters;
