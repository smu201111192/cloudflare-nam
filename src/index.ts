import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import gameRoutes from "./controllers/game/game.route";
import spectateRoutes from "./controllers/spectate/spectate.route";
import highlightRoute from "./controllers/highlight/highlight.route";
import { cors } from "hono/cors";
import { errorHandler } from "./middlewares/error.middleware";
import { Environment } from "./binding.types";
import httpStatus from "http-status";

const app = new Hono<Environment>();
const version = "v1";

app.use("/*", cors());
app.use(logger());

//@ts-ignore
app.use("/*", async (c: IContext, next) => {
  console.log(new Map(c.req.headers));
  await next();
});

app.use("*", poweredBy());
app.use("*", prettyJSON());

app.route(`/observer-mode/rest/consumer`, spectateRoutes);

app.route(`/${version}/game`, gameRoutes);
app.route(`/${version}/highlights`, highlightRoute);

app.notFound((c) => {
  // c.notFound() 호출시 일로옴
  return c.text("Not Found", httpStatus.NOT_FOUND);
});

app.onError(errorHandler);

export default app;