import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { Database } from "../../db/supabase";
import { Handler } from "hono";
import { Environment } from "../../binding.types";
import { getConfig } from "../../config/config";
import * as highlightService from "../../service/highlights.service";

export const getHighlights: Handler<Environment> = async (c) => {
  const dbConfig = getConfig(c.env).database;
  const data = await highlightService.queryUsers(dbConfig);
  return c.json(data);
};
