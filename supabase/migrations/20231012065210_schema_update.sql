alter table "public"."match_players" alter column "match_id" set data type character varying using "match_id"::character varying;

CREATE UNIQUE INDEX uc_matchplayers ON public.match_players USING btree (match_id, participant_id);

alter table "public"."match_players" add constraint "match_players_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) not valid;

alter table "public"."match_players" validate constraint "match_players_match_id_fkey";

alter table "public"."match_players" add constraint "uc_matchplayers" UNIQUE using index "uc_matchplayers";


