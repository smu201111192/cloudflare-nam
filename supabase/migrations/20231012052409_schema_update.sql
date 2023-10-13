alter table "public"."champions" drop constraint "champions_name_key";

drop index if exists "public"."champions_name_key";

alter table "public"."champions" drop column "name";

alter table "public"."champions" add column "cn_name" character varying not null;

alter table "public"."champions" add column "key" character varying not null;

alter table "public"."champions" add column "kr_name" character varying not null;

CREATE UNIQUE INDEX champions_cn_name_key ON public.champions USING btree (cn_name);

CREATE UNIQUE INDEX champions_key_key ON public.champions USING btree (key);

CREATE UNIQUE INDEX champions_name_key ON public.champions USING btree (kr_name);

alter table "public"."champions" add constraint "champions_cn_name_key" UNIQUE using index "champions_cn_name_key";

alter table "public"."champions" add constraint "champions_key_key" UNIQUE using index "champions_key_key";

alter table "public"."champions" add constraint "champions_name_key" UNIQUE using index "champions_name_key";


