import { Config } from "./config";
import { Database } from "../db/supabase";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
let db: SupabaseClient<Database>;

export const getDB = (
  dbConfig: Config["database"]
): SupabaseClient<Database> => {
  if (db) return db;
  db = createClient(dbConfig.supabase_url, dbConfig.supabase_key);
  return db;
};
