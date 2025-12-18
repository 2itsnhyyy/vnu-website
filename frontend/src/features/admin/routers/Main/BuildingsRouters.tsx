import Buildings from "../../pages/Buildings";
import AddBuilding from "../../pages/Buildings/addBuilding/index";

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
];

export default BuildingsRouters;
