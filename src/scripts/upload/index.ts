import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { Data } from "./HighlightModel";
import { getRiotApi } from "../../utils/getRiotApi";
import { Regions, regionToRegionGroup } from "../../twisted/constants";
import { parseRofl } from "../parseRofl/praseRofl";
import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { PrismaClient } from "@prisma/client";

import ky, { Options } from "ky";

import PQueue from "p-queue";

import {
  getGameChunkBinaryPath,
  getGameDataPath,
  getKeyframeBinaryPath,
  getGameMetadataPath,
} from "../../utils/getR2Path";
import { Database } from "../../db/supabase";

config();

const queue = new PQueue({ concurrency: 20 });

enum HighlightPlayerType {
  MainPlayer = "MainPlayer",
  Victim = "Victims",
}

const client = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const api = getRiotApi(process.env.RIOT_API_KEY!);

const rootFolder: string = process.argv[2];

if (!rootFolder || rootFolder.trim().length === 0) {
  throw new Error("you should set rootFolder");
}

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

async function uploadBunnyVideo(localVideoPath: string) {
  const url = `https://video.bunnycdn.com/library/${process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID}/videos`;
  const options: Options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/*+json",
      AccessKey: process.env.BUNNY_STREAM_API_KEY!,
    },
    json: {
      title: "hi2",
    },
  };

  const res = ky.post(url, options);
  const { guid: videoId, ...rest } = await res.json<{ guid: string }>();
  const file_buffer = fs.readFileSync(localVideoPath);
  const blob_object = new Blob([file_buffer]);

  //@ts-ignore

  try {
    const res = await ky.put(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID}/videos/${videoId}`,
      {
        headers: {
          accept: "application/json",
          AccessKey: process.env.BUNNY_STREAM_API_KEY!,
        },
        body: blob_object,
      }
    );
    const { statusCode, success } = await res.json<{
      success: boolean;
      statusCode: number;
    }>();
    if (statusCode === 200) return videoId;
    return null;
  } catch (e) {
    console.error(e);
  }
}
async function uploadReplayData(jsonDataPath: string, roflPath: string) {
  const gameData = JSON.parse(fs.readFileSync(jsonDataPath, "utf-8")) as Data;
  const [gameId, platformId] = [
    gameData.match.game_id,
    gameData.match.platform_id,
  ];

  const { game, metadata, keyframe_bytes_array, game_chunk_bytes_Array } =
    parseRofl(roflPath);

  const start = Math.max(gameData.scene.record_start_second - 10, 0);
  const end = gameData.scene.record_end_second + 10;

  let keyframeStart = Math.floor(start / 60);
  let keyframeEnd = Math.min(
    Math.round(end / 60) + 1,
    metadata.pendingAvailableKeyFrameInfo.length
  );

  metadata.pendingAvailableKeyFrameInfo =
    metadata.pendingAvailableKeyFrameInfo.slice(keyframeStart, keyframeEnd);

  metadata.pendingAvailableChunkInfo =
    metadata.pendingAvailableChunkInfo.filter((chunkInfo) => {
      let left = metadata.pendingAvailableKeyFrameInfo[0].keyFrameId * 2; // 첫번째 chunk는 metadata임
      let right =
        metadata.pendingAvailableKeyFrameInfo[
          metadata.pendingAvailableKeyFrameInfo.length - 1
        ].keyFrameId *
          2 +
        2;
      if (chunkInfo.chunkId >= left && chunkInfo.chunkId <= right) return true;
    });
  metadata.endGameKeyFrameId =
    metadata.pendingAvailableKeyFrameInfo[
      metadata.pendingAvailableKeyFrameInfo.length - 1
    ].keyFrameId;

  metadata.endGameChunkId =
    metadata.pendingAvailableChunkInfo[
      metadata.pendingAvailableChunkInfo.length - 1
    ].chunkId;
  metadata.lastChunkId = metadata.endGameChunkId;
  metadata.lastKeyFrameId = metadata.endGameKeyFrameId;

  const S3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_END_POINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY!,
      secretAccessKey: process.env.R2_SECRET_KEY!,
    },
  });

  for (let i = 1; i <= keyframe_bytes_array.length; i++) {
    const buffer = keyframe_bytes_array[i - 1];
    if (
      metadata.pendingAvailableKeyFrameInfo.some(
        (keyframe) => keyframe.keyFrameId === i
      )
    ) {
      queue.add(() =>
        S3.send(
          new PutObjectCommand({
            Body: buffer,
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: getKeyframeBinaryPath(platformId, gameId, i),
            ContentType: "application/octet-stream",
          })
        )
      );
    }
  }

  for (let i = 1; i <= game_chunk_bytes_Array.length; i++) {
    const buffer = game_chunk_bytes_Array[i - 1];
    if (
      i === 1 ||
      metadata.pendingAvailableChunkInfo.some(
        (chunkInfo) => chunkInfo.chunkId === i
      )
    ) {
      queue.add(() =>
        S3.send(
          new PutObjectCommand({
            Body: buffer,
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: getGameChunkBinaryPath(platformId, gameId, i),
            ContentType: "application/octet-stream",
          })
        )
      );
    }
  }

  // https://25df4e95a8fb6f173ca7baf206eb19e9.r2.cloudflarestorage.com/preview-local-replay-bucket/game/KR/6726973213/metadata.json

  await S3.send(
    new PutObjectCommand({
      Body: JSON.stringify(metadata),
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: getGameMetadataPath(platformId, gameId),
      ContentType: "application/json",
    })
  );

  await S3.send(
    new PutObjectCommand({
      Body: JSON.stringify(game),
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: getGameDataPath(platformId, gameId),
      ContentType: "application/json",
    })
  );

  const __dirname = path.resolve();
  const dPath = path.join(__dirname, gameId + ".json");
  console.log(dPath);
  fs.writeFileSync(
    path.join(__dirname, gameId + ".json"),
    JSON.stringify(metadata),
    "utf-8"
  );
}

async function upload() {
  const fileNames = fs.readdirSync(rootFolder, "utf-8");
  const videoArray = fileNames.filter((fileName) => fileName.endsWith(".mp4"));

  for (const videoFileName of videoArray) {
    const fileName = path.parse(videoFileName).name;
    const jsonPath = path.join(rootFolder, fileName + ".json");
    const roflPath = path.join(rootFolder, fileName + ".rofl");
    const videoPath = path.join(rootFolder, fileName + ".mp4");

    if (
      [jsonPath, roflPath, videoPath].every((filePath) =>
        fs.existsSync(filePath)
      ) === false
    )
      continue;
    const gameData = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as Data;

    const matchId = gameData.match.platform_id + "_" + gameData.match.game_id;

    const { response: matchResp } = await api.MatchV5.get(
      matchId,
      regionToRegionGroup(gameData.match.platform_id as Regions)
    );

    const participants = matchResp.info.participants.map((p) => ({
      championId: p.championId,
      championName: p.championName,
      puuid: p.puuid,
      summonerName: p.summonerName,
      participantId: p.participantId,
      teamId: p.teamId,
    }));

    // insert champions
    const championData = await getChampionData();

    for (const p of participants) {
      const championInfo = championData[p.championId];
      await client.from("champions").upsert({
        id: p.championId,
        eng_name: championInfo.champEng,
        kr_name: championInfo.champKr,
        cn_name: championInfo.champCn,
        key: championInfo.champKey,
      });
    }

    const getShortVersion = (version: string) => {
      const [majorVersion, minorVersion, _] = version.split(".");
      return `${majorVersion}.${minorVersion}`;
    };

    const getSeason = (version: string) => {
      const [season, _] = version.split(".");
      return Number(season);
    };

    await client.from("matches").upsert([
      {
        id: matchId,
        game_id: gameData.match.game_id,
        game_mode: matchResp.info.gameMode,
        queue_id: matchResp.info.queueId,
        creation_date: matchResp.info.gameCreation,
        game_version: matchResp.info.gameVersion,
        short_game_version: getShortVersion(matchResp.info.gameVersion),
        game_type: matchResp.info.gameType,
        region: matchResp.info.platformId,
        season: getSeason(matchResp.info.gameVersion),
      },
    ]);

    await uploadReplayData(jsonPath, roflPath);
    console.log(videoPath);
    const videoId = await uploadBunnyVideo(videoPath);
    if (!videoId) {
      throw new Error("Fail to upload video to bunny cdn");
    }

    const [highlight] = (
      await client
        .from("highlights")
        .insert({
          name: gameData.scene.selectedPlayer.champ_name + " 하이라이트",
          bunny_video_key: videoId,
          start_timestamp: gameData.scene.record_start_second,
          end_timestamp: gameData.scene.record_end_second,
          match_id: matchId,
          region: matchResp.info.platformId,
        })
        .select("*")
    ).data!;

    for (const p of participants) {
      const { response: summonerResp } = await api.Summoner.getByPUUID(
        p.puuid,
        matchResp.info.platformId as Regions
      );

      const { response: leagueResp } = await api.League.bySummoner(
        summonerResp.id,
        matchResp.info.platformId as Regions
      );

      summonerResp.revisionDate;

      const [summoner] =
        (
          await client
            .from("summoners")
            .upsert({
              puuid: p.puuid,
              name: summonerResp.name,
              revisionDate: summonerResp.revisionDate,
              region: matchResp.info.platformId,
            })
            .select()
        ).data || [];

      const [player] =
        (
          await client
            .from("match_players")
            .upsert({
              tier: gameData.match.players.find(
                (player) => player.participant_id === p.participantId
              )!.tier as string,
              rank: gameData.match.players.find(
                (player) => player.participant_id === p.participantId
              )!.rank as string,
              league_points: 0,
              team_id: p.teamId,
              summoner_puuid: summonerResp.puuid,
              player_name: p.summonerName,
              match_id: matchId,
              participant_id: p.participantId,
              champion_id: p.championId,
            })
            .select()
        ).data || [];

      if (
        gameData.scene.selectedPlayer.participant_id === player.participant_id
      ) {
        await client.from("highlight_players").upsert({
          player_id: player.id,
          player_highlight_type: HighlightPlayerType.MainPlayer,
          highlight_id: highlight.id,
        });
      }
    }
  }
}

upload();
