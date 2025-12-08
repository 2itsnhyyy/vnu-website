import adminRoutes from "../admin/routers";
import userRoutes from "../users/routers";

const routes = [...adminRoutes, ...userRoutes];

export default routes;
