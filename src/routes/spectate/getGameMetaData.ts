import { Context } from "hono";
import { spectateService } from "../../service/SpectateService";
import { getClinetIp } from "../../utils/getClientIp";
import { IContext } from "../../interfaces/IContext";
import { Region } from "../../db/enums";


// 특정-플랫폼-매치아이디-

export default async function getGameMetaData(c: IContext) {
  const region = c.req.param("region");
  const gameId = c.req.param("gameId");
  
  if(!region || !gameId ) {    
    return c.json({ message: "missing parameters" }, 400);
  }    

  if (!Object.keys(Region).includes(region)) {
    return c.json({message: "invalid region"}, 400);
  }
  
  const data = await spectateService.getGameMetaData(c, {gameId, region});
  
  if(!data) {
    return c.notFound();
  }

  await c.env.MY_KV.put(gameId + getClinetIp(c), '0');
  
  return c.json(data)
}
