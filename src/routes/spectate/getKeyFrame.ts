import { Context } from "hono";

import { spectateService } from "../../service/SpectateService";
import { Region } from "../../db/enums";
import { IBindings } from "../../interfaces/IContext";


export default async function getKeyFrame(c: Context<string,{Bindings: IBindings}>) {
  const region = c.req.param("region");
  const gameId = c.req.param("gameId");
  const keyFrameId = c.req.param("keyFrameId");

  if(!region || !gameId || !keyFrameId) {    
    return c.json({ message: "missing parameters" }, 400);
  }

  if (!Object.keys(Region).includes(region)) {
    return c.json({message: "invalid region"}, 400);
  }

  const blob =  await spectateService.getKeyFrame(c, {region, gameId, keyFrameId})
  if(!blob) {
    return c.notFound();
  }
  const data = await blob.arrayBuffer()  
  return c.newResponse(data, 200);
}


// spectate.get("/getLastChunkInfo/:region/:gameId/:chunkId/token", async (c) => {  

// });