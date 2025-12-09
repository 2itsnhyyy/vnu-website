import UsersRouters from "./UsersRouters";
import LocationsRouters from "./LocationsRouters";
import BuildingsRouters from "./BuildingsRouters";
import NewsRouters from "./NewsRouters";
import ForumRouters from "./ForumRouters";
import DashboardRouters from "./DashboardRouters";
import IncidentsRouters from "./IncidentsRouters";

const MainRouters = [
  ...DashboardRouters,
  ...UsersRouters,
  ...LocationsRouters,
  ...NewsRouters,
  ...IncidentsRouters,
  ...BuildingsRouters,
  ...ForumRouters,
];

export default MainRouters;
