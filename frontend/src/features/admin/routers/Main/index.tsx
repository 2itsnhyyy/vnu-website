import UsersRouters from "./UsersRouters";
import LocationsRouters from "./PlacesRouters";
import BuildingsRouters from "./BuildingsRouters";
import NewsRouters from "./NewsRouters";
import ForumRouters from "./ForumRouters";
import DashboardRouters from "./DashboardRouters";
import IncidentsRouters from "./IncidentsRouters";
import CommentRouters from "./CommentRouters";

const MainRouters = [
  ...DashboardRouters,
  ...UsersRouters,
  ...LocationsRouters,
  ...NewsRouters,
  ...IncidentsRouters,
  ...BuildingsRouters,
  ...ForumRouters,
  ...CommentRouters,
];

export default MainRouters;
