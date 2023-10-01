import { getDB } from "../../utils/getDB";
import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { Data } from "./HighlightModel";
import { getRiotApi } from "../../utils/getRiotApi";
import { Regions, regionToRegionGroup } from "../../twisted/constants";
import { parseRofl } from "../parseRofl/praseRofl";
import { Region, TIERENUM } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import PQueue from "p-queue";

const queue = new PQueue({ concurrency: 20 });

config();

const rootFolder: string = process.argv[2];

if (!rootFolder || rootFolder.trim().length === 0) {
  throw new Error("you should set rootFolder");
}

async function upload() {
  //@ts-ignore
  const db = getDB({
    DATABASE_URL: process.env.DATABASE_URL!,
    DATABASE_HOST: process.env.DATABASE_HOST!,
    DATABASE_USERNAME: process.env.DATABASE_USERNAME!,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD!,
  });

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
    const api = getRiotApi(
      //@ts-ignore
      { RIOT_API_KEY: process.env.RIOT_API_KEY! }
    );

    const [gameId, platformId] = [
      gameData.match.game_id,
      gameData.match.platform_id,
    ];
    
    const { game, metadata, keyframe_bytes_array, game_chunk_bytes_Array } =
      parseRofl(roflPath);

    if (gameId.toString() !== game.gameId || platformId !== game.platformId) {
      throw new Error(
        "Something wrong, The data obtained from json and the data obtained from rofl are different."
      );
    }

    const { response: matchResp } = await api.MatchV5.get(
      game.platformId + "_" + game.gameId,
      regionToRegionGroup(game.platformId as Regions)
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
    for (const p of participants) {
      const exist = await db
        .selectFrom("Champion")
        .selectAll()
        .where("Champion.id", "=", p.championId)
        .executeTakeFirst();
      if (exist) continue;
      await db
        .insertInto("Champion")
        .values({ id: p.championId, name: p.championName })
        .execute();
    }

    for (const p of participants) {
      let summoner = await db
        .selectFrom("Summoner")
        .selectAll()
        .where("Summoner.puuid", "=", p.puuid)
        .executeTakeFirst();

      if (!summoner) {
        const { response: summonerResp } = await api.Summoner.getByPUUID(
          p.puuid,
          game.platformId as Regions
        );

        const { response: leagueResp } = await api.League.bySummoner(
          summonerResp.id,
          game.platformId as Regions
        );

        // @ts-ignore
        summoner = await db
          .insertInto("Summoner")
          .values({
            name: summonerResp.name,
            puuid: p.puuid,
            tier: leagueResp[0].tier as TIERENUM,
            rank: leagueResp[0].rank,
            leaguePoints: leagueResp[0].leaguePoints,
            platformId: platformId as Region,
            encryptedSummonerId: summonerResp.id,
            updatedAt: new Date(),
            createdAt: new Date(),
            progamerId: null,
            streamerId: null,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
      }

      let match = await db
        .selectFrom("Match")
        .selectAll()
        .where("Match.gameId", "=", gameData.match.game_id)
        .where("Match.platformId", "=", gameData.match.platform_id as Region)
        .executeTakeFirst();

      if (!match) {
        const getShortVersion = (version: string) => {
          const [majorVersion, minorVersion, _] = version.split(".");
          return `${majorVersion}.${minorVersion}`;
        };

        await db
          .insertInto("Match")
          .values({
            gameCreation: matchResp.info.gameCreation,
            gameId: matchResp.info.gameId,
            shortGameVersion: getShortVersion(matchResp.info.gameVersion),
            gameVersion: matchResp.info.gameVersion,
            platformId: matchResp.info.platformId as Region,
            queueId: matchResp.info.queueId,
          })
          .execute();
      }

      let participant = await db
        .selectFrom("Participant")
        .selectAll()
        .where("Participant.summonerId", "=", summoner.id)
        .executeTakeFirst();

      const matchId = `${platformId}_${gameId}`;
      const gameFolder = `game/${matchId}`;
      const keyframesFolder = `${gameFolder}/keyframes`;
      const gameChunksFolder = `${gameFolder}/chunks`;
      const metaDataSavedPath = `${gameFolder}/metadata.json`;
      const gameDataSavedPath = `${gameFolder}/game.json`;

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
        queue.add(() =>
          S3.send(
            new PutObjectCommand({
              Body: buffer,
              Bucket: process.env.R2_BUCKET_NAME!,
              Key: `${keyframesFolder}/${i}.bin`,
              ContentType: "application/octet-stream",
            })
          )
        );
      }
      for (let i = 1; i <= game_chunk_bytes_Array.length; i++) {
        const buffer = game_chunk_bytes_Array[i - 1];
        queue.add(() => S3.send(
          new PutObjectCommand({
            Body: buffer,
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: `${gameChunksFolder}/${i}.bin`,
            ContentType: "application/octet-stream",
          })
        ))
      }
      await S3.send(
        new PutObjectCommand({
          Body: JSON.stringify(metadata),
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: metaDataSavedPath,
          ContentType: "application/json",
        })
      );
      await S3.send(
        new PutObjectCommand({
          Body: JSON.stringify(game),
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: gameDataSavedPath,
          ContentType: "application/json",
        })
      );

      if (!participant) {
        await db
          .insertInto("Participant")
          .values({
            playerName: p.summonerName,
            participantId: p.participantId,
            tier: gameData.match.players.find(
              (player) => player.participant_id === p.participantId
            )!.tier as TIERENUM,
            normalizedName: p.summonerName.replace(/ /g, "").trim(),
            teamId: p.teamId,
            championId: p.championId,
            summonerId: summoner.id,
            gameId: gameData.match.game_id,
            platformId: game.platformId as Region,
          })
          .execute();
      }
    }
  }
}

upload();
