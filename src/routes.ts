import { Router } from "express";
import authRoute from "./app/modules/auth/auth.route";
import { userRoute } from "./app/modules/user/user.route";
import { ProductRoutes } from "./app/modules/product/product.route";
import { withdrawRoute } from "./app/modules/withdrow/withdrow.route";
import { HistoryRoutes } from "./app/modules/history/history.route";

const appRouter = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoute },
  { path: "/user", route: userRoute },
  { path: "/product", route: ProductRoutes },
  { path: "/withdraw", route: withdrawRoute },
  { path: "/history", route: HistoryRoutes },
];

moduleRoutes.forEach((route) => appRouter.use(route.path, route.route));
export default appRouter;
