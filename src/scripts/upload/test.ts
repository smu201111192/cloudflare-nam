import { LolApi } from "../../twisted";
import { config } from "dotenv";
import { RegionGroups } from "../../twisted/constants";
config();

const api = new LolApi({ key: process.env.RIOT_API_KEY! });
api.MatchV5.get("KR_6726973213", RegionGroups.ASIA).then((res) => {
  console.log(res.response.info.platformId);
  console.log(res.response.info.gameType);
  console.log(res.response.info.queueId);
});
async function getChampionData() {
  const kr = (await api.DataDragon.getChampion("en_US")).data;
  const en = (await api.DataDragon.getChampion("ko_KR")).data;
  const cn = (await api.DataDragon.getChampion("zh_CN")).data;

  const champKeys = Object.keys(kr);
  let acc: Record<
    number,
    {
      champKey: string;
      champKr: string;
      champEng: string;
      champCn: string;
    }
  > = {};
  for (const champKey of champKeys) {
    const champKr = kr[champKey].name;
    const champEng = en[champKey].name;
    const champCn = cn[champKey].name;
    const id = Number(kr[champKey].key);

    acc[id] = {
      champKey,
      champKr,
      champEng,
      champCn,
    };
  }
  return acc;
}

// go();
