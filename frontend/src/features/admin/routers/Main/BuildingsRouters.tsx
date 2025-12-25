import Buildings from "../../pages/Buildings";
import AddBuilding from "../../pages/Buildings/addBuilding/index";
import EditBuilding from "../../pages/Buildings/editBuilding/index";

const BuildingsRouters = [
  {
    path: "buildings",
    element: <Buildings />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
    {
    path: "buildings/add",
    element: <AddBuilding />,
  },
  {
    path: "buildings/edit/:buildingId",
    element: <EditBuilding />,
  },
];

export default BuildingsRouters;
