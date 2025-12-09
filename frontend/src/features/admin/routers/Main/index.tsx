import UsersRouters from "./UsersRouters";
import LocationsRouters from "./LocationsRouters";
import NewsRouters from "../../../users/routers/Main/NewsRouters";
import BuildingsRouters from "./BuildingsRouters";
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
