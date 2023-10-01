import { Hono } from "hono";
import getVersion from "./getVersion";
import getLastChunkInfo from "./getLastChunkInfo";
import getGameDataChunk from "./getGameDataChunk";
import getGameMetaData from "./getGameMetaData";
import getKeyFrame from "./getKeyFrame";
import { IBindings } from "../../interfaces/IContext";

const spectateRoutes = new Hono<{Bindings: IBindings}>();

spectateRoutes.get("/getLastChunkInfo/:region/:gameId/:chunkId/token", getLastChunkInfo);
spectateRoutes.get("/getGameDataChunk/:region/:gameId/:chunkId/token", getGameDataChunk)
spectateRoutes.get("/getGameMetaData/:region/:gameId/:random/token",getGameMetaData)
spectateRoutes.get("/getKeyFrame/:region/:gameId/:keyFrameId/token",getKeyFrame)
spectateRoutes.get("/version", getVersion)



export default spectateRoutes;