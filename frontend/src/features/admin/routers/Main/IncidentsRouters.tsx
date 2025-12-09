import Incidents from "../../pages/Incidents";
import EditIncident from "../../pages/Incidents/EditIncident";
import ViewIncident from "../../pages/Incidents/ViewIncident";
import CreateIncident from "../../pages/Incidents/CreateIncident";

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
  {
    path: "incidents/:id",
    element: <ViewIncident />,
  },
  {
    path: "incidents/add",
    element: <CreateIncident />,
  },
];

export default IncidentsRouters;
