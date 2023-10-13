alter table "public"."matches" add column "game_type" character varying not null;

alter table "public"."matches" add column "game_version" character varying not null;

alter table "public"."matches" add column "queue_id" integer not null;

alter table "public"."matches" add column "short_game_version" character varying not null;

alter table "public"."matches" alter column "game_mode" set data type character varying using "game_mode"::character varying;


