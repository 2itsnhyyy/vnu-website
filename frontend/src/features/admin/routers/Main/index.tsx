import UsersRouters from "./UsersRouters";
import LocationsRouters from "./LocationsRouters";
import NewsRouters from "../../../users/routers/Main/NewsRouters";
import ProblemsRouters from "./ProblemsRouters";
import BuildingsRouters from "./BuildingsRouters";
import ForumRouters from "./ForumRouters";
import DashboardRouters from "./DashboardRouters";

const MainRouters = [
  ...DashboardRouters,
  ...UsersRouters,
  ...LocationsRouters,
  ...NewsRouters,
  ...ProblemsRouters,
  ...BuildingsRouters,
  ...ForumRouters,
];

export default MainRouters;
