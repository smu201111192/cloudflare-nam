import httpStatus from "http-status";
import { Environment } from "../binding.types";
import { ApiError } from "../utils/ApiError";

export const getCommand = async (
  bucket: R2Bucket,
  { gameId, region }: { gameId: string; region: string }
) => {
  const filePath = `${region}/${gameId}/game.json`;
  const res = await bucket.get(filePath);
  if (!res) {
    throw new ApiError(httpStatus.NOT_FOUND, "not found game data");
  }
  const obj = await res.json<{
    observers: {
      encryptionKey: string;
    };
  }>();
  const encryptionKey = obj.observers.encryptionKey;
  const command =
    `if test -d  /Applications/League\\ of\\ Legends.app/Contents/LoL/Game/ ; then cd /Applications/League\\ of\\ Legends.app/Contents/LoL/Game/ && chmod +x ./LeagueofLegends.app/Contents/MacOS/LeagueofLegends ; else cd /Applications/League\\ of\\ Legends.app/Contents/LoL/RADS/solutions/lol_game_client_sln/releases/ && cd $(ls -1vr -d */ | head -1) && cd deploy && chmod +x ./LeagueofLegends.app/Contents/MacOS/LeagueofLegends ; fi && riot_launched=true ./LeagueofLegends.app/Contents/MacOS/LeagueofLegends "spectator 127.0.0.1:8787 encryptionKey gameId platformId" "-UseRads" "-GameBaseDir=.."`
      .replace("encryptionKey", encryptionKey)
      .replace("gameId", gameId)
      .replace("platformId", region);
  return command;
};
