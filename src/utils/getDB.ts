import { IContext } from "../interfaces/IContext";
import { Kysely } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";
import { DB } from "../db/types";

let client: Kysely<DB> | null = null;

export const getDB = (env: IContext["env"]) => {
  if (client) return client;
  client = new Kysely<DB>({
    dialect: new PlanetScaleDialect({
      host: env.DATABASE_HOST,
      password: env.DATABASE_PASSWORD,
      username: env.DATABASE_USERNAME,
    }),
  });

  
  return client;
};


