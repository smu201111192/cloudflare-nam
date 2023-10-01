import { IContext } from "../interfaces/IContext";
import * as API from "../twisted/index";

// clas LolApi = API.LolApi;

let riotService:  API.LolApi | null = null;

export const getRiotApi = (env: IContext['env']) => {
    if(riotService) return riotService;
    riotService = new API.LolApi({key: env.RIOT_API_KEY});
    return riotService;
}

// export const getRiotApi = (env: IContext['env']) => {

// }




