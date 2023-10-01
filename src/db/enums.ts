export const RANKENUM = {
    I: "I",
    II: "II",
    III: "III",
    IV: "IV",
    V: "V"
} as const;
export type RANKENUM = (typeof RANKENUM)[keyof typeof RANKENUM];
export const UserRole = {
    ADMIN: "ADMIN",
    CREATOR: "CREATOR"
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const Region = {
    BR1: "BR1",
    EUN1: "EUN1",
    EUW1: "EUW1",
    KR: "KR",
    LA1: "LA1",
    LA2: "LA2",
    NA1: "NA1",
    OC1: "OC1",
    TR1: "TR1",
    RU: "RU",
    JP1: "JP1",
    PBE1: "PBE1"
} as const;
export type Region = (typeof Region)[keyof typeof Region];
export const TIERENUM = {
    UNRANKED: "UNRANKED",
    IRON: "IRON",
    BRONZE: "BRONZE",
    SILVER: "SILVER",
    GOLD: "GOLD",
    PLATINUM: "PLATINUM",
    EMERALD: "EMERALD",
    DIAMOND: "DIAMOND",
    MASTER: "MASTER",
    GRANDMASTER: "GRANDMASTER",
    CHALLENGER: "CHALLENGER"
} as const;
export type TIERENUM = (typeof TIERENUM)[keyof typeof TIERENUM];
export const HighlightPlayerType = {
    MainPlayer: "MainPlayer",
    Victim: "Victim"
} as const;
export type HighlightPlayerType = (typeof HighlightPlayerType)[keyof typeof HighlightPlayerType];
