import Incidents from "../../pages/Incidents";
import EditIncident from "../../pages/Incidents/EditIncident";

const IncidentsRouters = [
  {
    path: "incidents",
    element: <Incidents />,
    // Nếu sau này muốn tách các route con, có thể dùng cấu trúc children như bên dưới:
    // children: [
    //   { path: '', element: <List /> },
    //   { path: 'create', element: <Create /> },
    // ],
  },
  {
    path: "incidents/edit/:id",
    element: <EditIncident />,
  },
];

export default IncidentsRouters;
