import { Config } from "../config/config";
import { getDB } from "../config/getDB";
import { ApiError } from "../utils/ApiError";
import httpStatus from "http-status";

export async function queryUsers(dbConfig: Config["database"]) {
  const client = getDB(dbConfig);
  const { data, error } = await client
    .from("highlights")
    .select(`*, matches(*), highlight_players(*)`);
  if (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, JSON.stringify(error));
  }
  return data;
}
