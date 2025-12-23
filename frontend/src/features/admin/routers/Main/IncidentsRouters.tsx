import Incidents from "../../pages/Incidents";
import EditIncident from "../../pages/Incidents/EditIncident";
import ViewIncident from "../../pages/Incidents/ViewIncident";
import CreateIncident from "../../pages/Incidents/CreateIncident";

const IncidentsRouters = [
  {
    path: "incidents",
    element: <Incidents />,
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
