import { Context as HonoContext } from "hono";
import { Kysely } from "kysely";
import { DB } from "../db/types";

export interface ENV {
  Bindings: {
    DATABASE_URL: string;
    IS_DEV: boolean;
    APP_DB: D1Database;
    DATABASE_HOST: string;
    DATABASE_USERNAME: string;
    DATABASE_PASSWORD: string;
    MY_BUCKET: R2Bucket, 
    MY_KV: KVNamespace
  };
}
export interface IBindings {
  DATABASE_URL: string;
  IS_DEV: boolean;
  APP_DB: D1Database;
  DATABASE_HOST: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  MY_BUCKET: R2Bucket, 
  MY_KV: KVNamespace
  RIOT_API_KEY: string;
};
// Context<{Bindings: { MY_BUCKET: R2Bucket, MY_KV: KVNamespace }}>

export type IContext = HonoContext<string, {Bindings: IBindings}>;
