import { Context} from "hono";
// import { ALL_REGIONS } from "../../constants/Region";
import { spectateService } from "../../service/SpectateService";
import { Region } from "../../db/enums";
import { IBindings } from "../../interfaces/IContext";



export default async function getLastChunkInfo(c: Context<string,{Bindings: IBindings}>) {
          
  const region = c.req.param("region");
  const gameId = c.req.param("gameId");
  const chunkId = c.req.param("chunkId")

  if(!region || !gameId || !chunkId) {    
    return c.json({ message: "missing parameters" }, 400);
  }


  if (!Object.keys(Region).includes(region)) {
    return c.json({message: "invalid region"}, 400);
  }

  const data =  await spectateService.getLastChunkInfo(c, {region, gameId, chunkId})
  return c.json(data);

}
