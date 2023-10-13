alter table "public"."champions" drop constraint "champion_champion_id_key";

alter table "public"."champions" drop constraint "champion_champion_name_key";

drop index if exists "public"."champion_champion_id_key";

drop index if exists "public"."champion_champion_name_key";

alter table "public"."champions" drop column "champion_id";

alter table "public"."champions" drop column "champion_name";

alter table "public"."champions" add column "eng_name" character varying not null;

alter table "public"."champions" add column "name" character varying not null;

CREATE UNIQUE INDEX champions_eng_name_key ON public.champions USING btree (eng_name);

CREATE UNIQUE INDEX champions_name_key ON public.champions USING btree (name);

alter table "public"."champions" add constraint "champions_eng_name_key" UNIQUE using index "champions_eng_name_key";

alter table "public"."champions" add constraint "champions_name_key" UNIQUE using index "champions_name_key";


