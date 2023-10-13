export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      champions: {
        Row: {
          cn_name: string
          eng_name: string
          id: number
          key: string
          kr_name: string
        }
        Insert: {
          cn_name: string
          eng_name: string
          id?: number
          key: string
          kr_name: string
        }
        Update: {
          cn_name?: string
          eng_name?: string
          id?: number
          key?: string
          kr_name?: string
        }
        Relationships: []
      }
      highlight_players: {
        Row: {
          created_at: string
          highlight_id: number
          id: number
          player_highlight_type: string
          player_id: number
        }
        Insert: {
          created_at?: string
          highlight_id: number
          id?: number
          player_highlight_type: string
          player_id: number
        }
        Update: {
          created_at?: string
          highlight_id?: number
          id?: number
          player_highlight_type?: string
          player_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "highlight_players_highlight_id_fkey"
            columns: ["highlight_id"]
            referencedRelation: "highlights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "highlight_players_player_id_fkey"
            columns: ["player_id"]
            referencedRelation: "match_players"
            referencedColumns: ["id"]
          }
        ]
      }
      highlight_tags: {
        Row: {
          created_at: string
          highlight_id: number
          id: number
          tag_id: number
        }
        Insert: {
          created_at?: string
          highlight_id: number
          id?: number
          tag_id: number
        }
        Update: {
          created_at?: string
          highlight_id?: number
          id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "highlight_tags_highlight_id_fkey"
            columns: ["highlight_id"]
            referencedRelation: "highlights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "highlight_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      highlights: {
        Row: {
          bunny_video_key: string
          created_at: string
          end_timestamp: number
          id: number
          match_id: string
          name: string
          region: string
          start_timestamp: number
        }
        Insert: {
          bunny_video_key: string
          created_at?: string
          end_timestamp: number
          id?: number
          match_id: string
          name: string
          region: string
          start_timestamp: number
        }
        Update: {
          bunny_video_key?: string
          created_at?: string
          end_timestamp?: number
          id?: number
          match_id?: string
          name?: string
          region?: string
          start_timestamp?: number
        }
        Relationships: [
          {
            foreignKeyName: "highlights_match_id_fkey"
            columns: ["match_id"]
            referencedRelation: "matches"
            referencedColumns: ["id"]
          }
        ]
      }
      match_players: {
        Row: {
          champion_id: number
          created_at: string
          id: number
          league_points: number
          match_id: string
          participant_id: number
          player_name: string
          rank: string
          summoner_puuid: string
          team_id: number
          tier: string
        }
        Insert: {
          champion_id: number
          created_at?: string
          id?: number
          league_points: number
          match_id: string
          participant_id: number
          player_name: string
          rank: string
          summoner_puuid: string
          team_id: number
          tier: string
        }
        Update: {
          champion_id?: number
          created_at?: string
          id?: number
          league_points?: number
          match_id?: string
          participant_id?: number
          player_name?: string
          rank?: string
          summoner_puuid?: string
          team_id?: number
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_players_champion_id_fkey"
            columns: ["champion_id"]
            referencedRelation: "champions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_summoner_puuid_fkey"
            columns: ["summoner_puuid"]
            referencedRelation: "summoners"
            referencedColumns: ["puuid"]
          }
        ]
      }
      matches: {
        Row: {
          created_at: string
          creation_date: number
          game_id: number
          game_mode: string
          game_type: string
          game_version: string
          id: string
          queue_id: number
          region: string
          season: number
          short_game_version: string
        }
        Insert: {
          created_at?: string
          creation_date: number
          game_id: number
          game_mode: string
          game_type: string
          game_version: string
          id: string
          queue_id: number
          region: string
          season: number
          short_game_version: string
        }
        Update: {
          created_at?: string
          creation_date?: number
          game_id?: number
          game_mode?: string
          game_type?: string
          game_version?: string
          id?: string
          queue_id?: number
          region?: string
          season?: number
          short_game_version?: string
        }
        Relationships: []
      }
      platforms: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      progamers: {
        Row: {
          created_at: string
          id: number
          name: string
          proteam_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          proteam_id: number
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          proteam_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "progamers_proteam_id_fkey"
            columns: ["proteam_id"]
            referencedRelation: "proteams"
            referencedColumns: ["id"]
          }
        ]
      }
      proteams: {
        Row: {
          created_at: string
          id: number
          initial: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          initial: string
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          initial?: string
          name?: string
        }
        Relationships: []
      }
      streamers: {
        Row: {
          created_at: string
          id: number
          name: string
          streamer_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          streamer_id: number
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          streamer_id?: number
        }
        Relationships: []
      }
      summoners: {
        Row: {
          created_at: string
          name: string
          progamer_id: string | null
          puuid: string
          region: string
          revisionDate: number
          streamer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          name: string
          progamer_id?: string | null
          puuid: string
          region: string
          revisionDate: number
          streamer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          name?: string
          progamer_id?: string | null
          puuid?: string
          region?: string
          revisionDate?: number
          streamer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buckets_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

