export interface Player {
  participant_id: number;
  player_number: number;
  tier: string;
  skill_level_up_events: Event[];
  champ_name: string;
  name: string;
  champ_name_eng: string;
  lane: string;
  id: number;
  spell_1_name_id: string;
  spell_2_name_id: string;
  summoner_id: number;
  team: {
    id: number;
    match_id: number;
    team: "LEFT_TEAM" | "RIGHT_TEAM";
  };

  summoner: {
    name: string;

    before_season_solo_rank_league: {
      top_tier: string;
      tier: string;
      top_league_points: number;
    };

    is_pro: boolean;
    is_streamer: boolean;
    full_name?: string;
    nickname?: string;
    short_nickname: string;

    progamer?: {
      team?: {
        name: string;

        initial: string;
      };
    };

    spell_1_id: number;
    spell_2_id: number;
    spell_1_name_id: "SummonerDot" | "SummonerFlash" | "SummonerHeal";
    spell_2_name_id: "SummonerDot" | "SummonerFlash" | "SummonerHeal";
  };
}

export interface MatchEvent {
  killerId: number;

  victimId: number;

  timestamp: number;

  assistingParticipantIds: number[];

  type: string;

  position: {
    x: number;
    y: number;
  };
  victimDamageReceived: any;
}

export interface Event {
  id: string;
  player_id: string;
  timestamp: number;
}

export interface Filter {
  params: {
    minimumPlayerMultipleKill: number;
    maximumNumAssist: number;
  };
}

export interface Scene {
  numKill: number;
  matchEventList: MatchEvent[];
  selectedPlayer: Player;
  filter: Filter;
  recordSpeed: number;
  record_start_second: number;
  record_end_second: number;
}

export interface Match {
  players: Player[];
  short_game_version: string;
  platform_id: string;
  game_id: number;
  game_duration: number;
  game_created_at: number;
}

export interface Data {
  scene: Scene;
  match: Match;
  fileName: string;
  filePath?: string;
}

export interface AnalysisPlayer {
  number: number;
  hpPercent: number;
  ultimate: boolean;
  summonerSpell1: boolean;
  summonerSpell2: boolean;
}

export interface AnalysisFrame {
  second: number;
  players: AnalysisPlayer[];
}

export interface AnalysisEvent {
  type: "ULTIMATE_SPELL_CHANGE" | "SUMMONER_SPELL_CHANGE";
  second: number;
  playerNumber: number;
  active: boolean;
}

export interface Analysis {
  frames: AnalysisFrame[];
  events: AnalysisEvent[];
}
