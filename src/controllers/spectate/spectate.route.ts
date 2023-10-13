import { Hono } from "hono";
import * as spectateController from "./spectate.controller";
import { Environment } from "../../binding.types";

const spectateRoutes = new Hono<Environment>();

spectateRoutes.get(
  "/getLastChunkInfo/:region/:gameId/:chunkId/token",
  spectateController.getLastChunkInfo
);
spectateRoutes.get(
  "/getGameDataChunk/:region/:gameId/:chunkId/token",
  spectateController.getGameDataChunk
);
spectateRoutes.get(
  "/getGameMetaData/:region/:gameId/:random/token",
  spectateController.getGameMetaData
);
spectateRoutes.get(
  "/getKeyFrame/:region/:gameId/:keyFrameId/token",
  spectateController.getKeyFrame
);

spectateRoutes.get("/version", spectateController.getVersion);

export default spectateRoutes;
