import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { RANKENUM, UserRole, Region, TIERENUM, HighlightPlayerType } from "./enums";

export type BookmarksOnHighlights = {
    userId: number;
    highlightId: number;
};
export type Champion = {
    id: number;
    name: string;
};
export type HighlightPlayer = {
    id: Generated<number>;
    tier: TIERENUM;
    participantId: number;
    playerType: HighlightPlayerType;
};
export type HighlightResource = {
    id: Generated<number>;
    name: string;
    createdAt: Generated<Timestamp>;
    roflUrlKey: string;
    originalVideoUrlKey: string;
    selectedPlayerId: number;
    victimPlayerExportId: number;
    startTimestamp: number;
    endTimestamp: number;
    gameId: number;
    platformId: Region;
};
export type HighlightResourceToHighlightTag = {
    A: number;
    B: number;
};
export type HighlightTag = {
    id: Generated<number>;
    name: string;
};
export type HighlightUseHistory = {
    userId: number;
    highlightId: number;
};
export type Match = {
    id: Generated<number>;
    gameVersion: string;
    gameId: number;
    gameCreation: number;
    queueId: number;
    platformId: Region;
    shortGameVersion: string;
};
export type Participant = {
    id: Generated<number>;
    participantId: number;
    playerName: string;
    normalizedName: string;
    teamId: number;
    tier: TIERENUM;
    championId: number;
    summonerId: number;
    gameId: number;
    platformId: Region;
};
export type Platform = {
    id: Generated<number>;
    name: string;
};
export type Progamer = {
    id: Generated<number>;
    proTeamId: number;
    name: string;
};
export type ProTeam = {
    id: Generated<number>;
    name: string;
    initial: string;
};
export type Streamer = {
    id: Generated<number>;
    proTeamId: number;
    name: string;
};
export type Summoner = {
    id: Generated<number>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    encryptedSummonerId: string;
    tier: TIERENUM;
    rank: RANKENUM;
    leaguePoints: number;
    name: string;
    puuid: string;
    platformId: Region;
    progamerId: number | null;
    streamerId: number | null;
};
export type User = {
    id: Generated<number>;
    email: string;
    firebaseUserId: string;
    role: Generated<UserRole>;
};
export type DB = {
    _HighlightResourceToHighlightTag: HighlightResourceToHighlightTag;
    BookmarksOnHighlights: BookmarksOnHighlights;
    Champion: Champion;
    HighlightPlayer: HighlightPlayer;
    HighlightResource: HighlightResource;
    HighlightTag: HighlightTag;
    HighlightUseHistory: HighlightUseHistory;
    Match: Match;
    Participant: Participant;
    Platform: Platform;
    Progamer: Progamer;
    ProTeam: ProTeam;
    Streamer: Streamer;
    Summoner: Summoner;
    User: User;
};
