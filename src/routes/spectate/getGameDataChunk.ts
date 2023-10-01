import { Region } from "../../db/enums";
// import { ALL_REGIONS } from "../../constants/Region";
import { spectateService } from "../../service/SpectateService";
import { IContext } from "../../interfaces/IContext";

export default async function getGameDataChunk(c: IContext) {
  const region = c.req.param("region");
  const gameId = c.req.param("gameId");
  const chunkId = c.req.param("chunkId")
  
  if(!region || !gameId || !chunkId) {    
    return c.json({ message: "missing parameters" }, 400);
  }

  const ALL_REGIONS = Object.keys(Region)

  if (!ALL_REGIONS.includes(region)) {
    return c.json({message: "invalid region"}, 400);
  }

  const data =  await spectateService.getGameDataChunk(c, { gameId, region, chunkId})
  console.log("hi");
  if(!data) {
    return c.notFound();
  }

  const arrayBuffer = await data.arrayBuffer()
  
  
  //@ts-ignore
  return c.newResponse(arrayBuffer)
}
