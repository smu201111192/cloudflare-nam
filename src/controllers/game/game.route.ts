import { Context, Hono } from "hono";
import * as gameController from "./game.controller";
import { Environment } from "../../binding.types";

const gameRoutes = new Hono<Environment>();
gameRoutes.get("/startGame/:region/:gameId", gameController.startGame);

export default gameRoutes;
