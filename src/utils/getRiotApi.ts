import * as API from "../twisted/index";

let riotService: API.LolApi | null = null;

export const getRiotApi = (riotApiKey: string) => {
  if (riotService) return riotService;
  riotService = new API.LolApi({ key: riotApiKey });
  return riotService;
};
