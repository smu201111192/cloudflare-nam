alter table "public"."champions" alter column "cn_name" set data type text using "cn_name"::text;

alter table "public"."champions" alter column "eng_name" set data type text using "eng_name"::text;

alter table "public"."champions" alter column "key" set data type text using "key"::text;

alter table "public"."champions" alter column "kr_name" set data type text using "kr_name"::text;

alter table "public"."highlight_players" alter column "player_highlight_type" set data type text using "player_highlight_type"::text;

alter table "public"."highlights" alter column "bunny_video_key" set data type text using "bunny_video_key"::text;

alter table "public"."highlights" alter column "match_id" set data type text using "match_id"::text;

alter table "public"."highlights" alter column "name" set data type text using "name"::text;

alter table "public"."highlights" alter column "region" set data type text using "region"::text;

alter table "public"."match_players" alter column "match_id" set data type text using "match_id"::text;

alter table "public"."match_players" alter column "player_name" set data type text using "player_name"::text;

alter table "public"."match_players" alter column "rank" set data type text using "rank"::text;

alter table "public"."match_players" alter column "summoner_puuid" set data type text using "summoner_puuid"::text;

alter table "public"."match_players" alter column "tier" set data type text using "tier"::text;

alter table "public"."matches" alter column "game_mode" set data type text using "game_mode"::text;

alter table "public"."matches" alter column "game_type" set data type text using "game_type"::text;

alter table "public"."matches" alter column "game_version" set data type text using "game_version"::text;

alter table "public"."matches" alter column "id" set data type text using "id"::text;

alter table "public"."matches" alter column "region" set data type text using "region"::text;

alter table "public"."matches" alter column "short_game_version" set data type text using "short_game_version"::text;

alter table "public"."platforms" alter column "name" set data type text using "name"::text;

alter table "public"."progamers" alter column "name" set data type text using "name"::text;

alter table "public"."proteams" alter column "initial" set data type text using "initial"::text;

alter table "public"."proteams" alter column "name" set data type text using "name"::text;

alter table "public"."streamers" alter column "name" set data type text using "name"::text;

alter table "public"."summoners" alter column "name" set data type text using "name"::text;

alter table "public"."summoners" alter column "progamer_id" set data type text using "progamer_id"::text;

alter table "public"."summoners" alter column "puuid" set data type text using "puuid"::text;

alter table "public"."summoners" alter column "region" set data type text using "region"::text;

alter table "public"."summoners" alter column "streamer_id" set data type text using "streamer_id"::text;

alter table "public"."tags" alter column "name" set data type text using "name"::text;


