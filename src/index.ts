import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import highlights from "./routes/highlights";
import { LolApi } from "./twisted";
import { RegionGroups, Regions } from "./twisted/constants";
const app = new Hono();

app.use(logger());
app.use("*", poweredBy());
app.use("*", prettyJSON());
app.route("/highlights", highlights);

app.get("/", async (c) => {

  const api = new LolApi({ key: "" });
  const summoner = await api.Summoner.getByName("Hide on bush", Regions.KOREA);  
  const { response: matchIds } = await api.MatchV5.list(
    summoner.response.puuid,
    RegionGroups.ASIA,
    { count: 1 }
  );

  let promises: Promise<any>[] = [];

  for (const matchId of matchIds) {
    const go = async () => {

      const { response } = await api.MatchV5.get(matchId, RegionGroups.ASIA);
      const gameCreation = response.info.gameCreation;
      const gameVersion = response.info.gameVersion;
      const participants = response.info.participants.map((p) => {
        return {
          championName: p.championName,
          summonerName: p.summonerName,
          teamId: p.teamId,
        };
      });
      const d = {
        gameCreation,
        gameVersion,
        participants,
      };
      return d;
    };
    promises.push(go())
    // data.push(d);
  }
  const data = await Promise.all(promises);

  return c.json({ data });
});

export default app;
