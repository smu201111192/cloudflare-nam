import { IMetaData } from "../interfaces/IMetaData";
import { ILastChunkInfo } from "../interfaces/ILastChunkInfo";

import {
  getGameDataPath,
  getGameMetadataPath,
  getKeyframeBinaryPath,
  getGameChunkBinaryPath,
} from "../utils/getR2Path";
import { ApiError } from "../utils/ApiError";
import httpStatus from "http-status";

export function getVersion() {
  return "2.0.0";
}

export const getGameData = async (
  bucket: R2Bucket,
  {
    region,
    gameId,
  }: {
    region: string;
    gameId: string;
  }
) => {
  const filePath = getGameDataPath(region, Number(gameId));
  const res = await bucket.get(filePath);
  return res?.json<{
    observers: {
      encryptionKey: string;
    };
  }>();
};

export const getGameMetaData = async (
  bucket: R2Bucket,
  kv: KVNamespace,
  {
    region,
    gameId,
    clientIp,
  }: { region: string; gameId: string; clientIp: string }
): Promise<IMetaData> => {
  const filePath = getGameMetadataPath(region, Number(gameId));
  const res = await bucket.get(filePath);
  const data = res?.json<IMetaData>();

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "no data");
  }
  await kv.put(gameId + clientIp, "0");
  return data;
};

export const getGameDataChunk = async (
  bucket: R2Bucket,
  {
    region,
    gameId,
    chunkId,
  }: {
    region: string;
    gameId: string;
    chunkId: string;
  }
) => {
  const filePath = getGameChunkBinaryPath(
    region,
    Number(gameId),
    Number(chunkId)
  );
  const res = await bucket.get(filePath);
  return res?.blob();
};

export const getKeyFrame = async (
  bucket: R2Bucket,
  {
    region,
    gameId,
    keyFrameId,
  }: {
    region: string;
    gameId: string;
    keyFrameId: string;
  }
) => {
  const filePath = getKeyframeBinaryPath(
    region,
    Number(gameId),
    Number(keyFrameId)
  );

  const res = await bucket.get(filePath);
  return res?.blob();
};
const findKeyFrameByChunkId = (metadata: IMetaData, chunkId: number) => {
  let keyFrameId = 1;
  for (let keyFrameInfo of metadata.pendingAvailableKeyFrameInfo) {
    if (keyFrameInfo.nextChunkId > chunkId) {
      break;
    }
    keyFrameId = keyFrameInfo.keyFrameId;
  }
  return keyFrameId;
};

export const getLastChunkInfo = async (
  bucket: R2Bucket,
  kv: KVNamespace,
  {
    clientIp,
    region,
    gameId,
    chunkId,
  }: { region: string; gameId: string; chunkId: string; clientIp: string }
) => {
  console.time("getLastChunkInfo kv - get");
  const lastChunkStr = await kv.get(gameId + clientIp);
  console.timeEnd("getLastChunkInfo kv - get");
  if (lastChunkStr === null) {
    throw new Error("invalid call");
  }

  const lastChunkId = parseInt(lastChunkStr);

  let currentChunkId = lastChunkId + 1;
  //
  console.time("getLastChunkInfo kv - put");
  // KV 60초까지 걸릴 수 있다?
  // 글로벌로 propagate하는 과정을 거친다고 하는데...

  await kv.put(gameId + clientIp, currentChunkId.toString());
  console.timeEnd("getLastChunkInfo kv - put");

  const metadataPath = getGameMetadataPath(region, Number(gameId));

  console.time("getLastChunkInfo R2 - get");
  const data = await bucket.get(metadataPath);
  console.timeEnd("getLastChunkInfo R2 - get");

  if (!data) {
    throw new Error("Not Found");
  }
  const metadata: IMetaData = await data.json();

  if (
    metadata.pendingAvailableChunkInfo.length === 0 ||
    metadata.pendingAvailableKeyFrameInfo.length === 0
  )
    throw new Error("No chunks or keyFrames available");

  const firstChunkWithKeyFrame =
    metadata.pendingAvailableKeyFrameInfo[0].nextChunkId;
  let firstChunkId = firstChunkWithKeyFrame;

  // Quoting Divi from 7 years ago: "A bug appears when endStartupChunkId = 3 and startGameChunkId = 5, the game won't load"
  // Never had that an endStartupChunkId at 3 but leaving it for safety
  if (metadata.endStartupChunkId + 2 === firstChunkId) {
    firstChunkId = metadata.startGameChunkId + 2;
  }

  let keyFrameId = findKeyFrameByChunkId(metadata, firstChunkId);

  const lastChunkInfo: ILastChunkInfo = {
    chunkId: firstChunkId,
    availableSince: 30000,
    nextAvailableChunk: 30000,
    nextChunkId: firstChunkId,
    keyFrameId: keyFrameId,
    endStartupChunkId: metadata.endStartupChunkId,
    startGameChunkId: metadata.startGameChunkId,
    endGameChunkId: 0,
    duration: 30000,
  };

  // If we don't have the chunks between 1 and the first chunk with keyFrame, skip them in order
  // to avoid the client to call getLastChunkInfo an unnecessary amount of times
  if (
    firstChunkId !== metadata.startGameChunkId &&
    currentChunkId - 1 == metadata.startGameChunkId
  ) {
    currentChunkId = firstChunkId;

    await kv.put(gameId + clientIp, currentChunkId.toString());
    // this._clientsLastChunk[gameId + ip] = currentChunkId;
  }

  // In-game chunks
  if (currentChunkId > metadata.startGameChunkId) {
    // Failsafes for currentChunkId to not go out of bounds
    if (currentChunkId > metadata.lastChunkId) {
      currentChunkId = metadata.lastChunkId;
    } else if (currentChunkId < firstChunkWithKeyFrame) {
      currentChunkId = firstChunkWithKeyFrame;
    }
    keyFrameId = findKeyFrameByChunkId(metadata, currentChunkId);
    lastChunkInfo.keyFrameId = keyFrameId;
    lastChunkInfo.chunkId = currentChunkId;
    lastChunkInfo.nextChunkId = metadata.lastChunkId;
    lastChunkInfo.nextAvailableChunk =
      currentChunkId === firstChunkId + 6 ? 30000 : 100;
  }

  // No more chunks, game is finished.
  if (currentChunkId === metadata.lastChunkId) {
    lastChunkInfo.nextAvailableChunk = 90000;
    lastChunkInfo.endGameChunkId = metadata.endGameChunkId;
    // this.logInfo(`Client ${ip} has queried the last chunk info of game ${gameId} (${region})`);
  }
  return lastChunkInfo;
};

// export const spectateService = new SpectateService();
