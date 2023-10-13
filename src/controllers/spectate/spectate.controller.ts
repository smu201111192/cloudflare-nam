import { Handler } from "hono";
import { Region } from "../../db/enums";
import * as spectateService from "../../service/SpectateService";
import { getClinetIp } from "../../utils/getClientIp";
import { Environment } from "../../binding.types";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

export const getGameDataChunk: Handler<Environment> = async (c) => {
  const region = c.req.param("region");
  const gameId = c.req.param("gameId");
  const chunkId = c.req.param("chunkId");
  if (!region || !gameId || !chunkId) {
    return c.json({ message: "missing parameters" }, 400);
  }
  const ALL_REGIONS = Object.keys(Region);
  if (!ALL_REGIONS.includes(region)) {
    return c.json({ message: "invalid region" }, 400);
  }
  const data = await spectateService.getGameDataChunk(c.env.MY_BUCKET, {
    gameId,
    region,
    chunkId,
  });
  if (!data) {
    return c.notFound();
  }
  const arrayBuffer = await data.arrayBuffer();
  //@ts-ignore
  return c.newResponse(arrayBuffer);
};

export const getGameMetaData: Handler<Environment> = async (c) => {
  const region = c.req.param("region");
  const gameId = c.req.param("gameId");

  if (!region || !gameId) {
    return c.json({ message: "missing parameters" }, 400);
  }

  if (!Object.keys(Region).includes(region)) {
    return c.json({ message: "invalid region" }, 400);
  }

  const clientIp = getClinetIp(c);
  if (!clientIp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "unauthrized");
  }
  const data = await spectateService.getGameMetaData(
    c.env.MY_BUCKET,
    c.env.MY_KV,
    {
      gameId,
      region,
      clientIp,
    }
  );
  return c.json(data);
};

export const getKeyFrame: Handler<Environment> = async (c) => {
  const region = c.req.param("region");
  const gameId = c.req.param("gameId");
  const keyFrameId = c.req.param("keyFrameId");

  if (!region || !gameId || !keyFrameId) {
    return c.json({ message: "missing parameters" }, 400);
  }

  if (!Object.keys(Region).includes(region)) {
    return c.json({ message: "invalid region" }, 400);
  }

  const blob = await spectateService.getKeyFrame(c.env.MY_BUCKET, {
    region,
    gameId,
    keyFrameId,
  });
  if (!blob) {
    return c.notFound();
  }
  const data = await blob.arrayBuffer();
  return c.newResponse(data, 200);
};

export const getLastChunkInfo: Handler<Environment> = async (c) => {
  const region = c.req.param("region");
  const gameId = c.req.param("gameId");
  const chunkId = c.req.param("chunkId");

  if (!region || !gameId || !chunkId) {
    return c.json({ message: "missing parameters" }, 400);
  }

  if (!Object.keys(Region).includes(region)) {
    return c.json({ message: "invalid region" }, 400);
  }

  const clientIp = getClinetIp(c);
  if (!clientIp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "unauthroized");
  }

  const data = await spectateService.getLastChunkInfo(
    c.env.MY_BUCKET,
    c.env.MY_KV,
    {
      clientIp,
      region,
      gameId,
      chunkId,
    }
  );

  console.log(`getLastChunkInfo, chunkId:${chunkId}`);
  console.log(JSON.stringify(data, null, 4));

  return c.json(data);
};

export const getVersion: Handler<Environment> = async (c) => {
  const version = spectateService.getVersion();
  return c.text(version);
};
