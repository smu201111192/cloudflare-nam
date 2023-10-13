import httpStatus from "http-status";
import { ZodError, z } from "zod";
import { Environment } from "../binding.types";
import { ApiError } from "../utils/ApiError";
import { generateZodErrorMessage } from "../utils/zod";

const envVarsSchema = z.object({
  ENV: z.union([
    z.literal("production"),
    z.literal("development"),
    z.literal("test"),
  ]),
  RIOT_API_KEY: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_KEY: z.string(),
});

export type EnvVarsSchemaType = z.infer<typeof envVarsSchema>;

export interface Config {
  env: "production" | "development" | "test";
  database: {
    supabase_url: string;
    supabase_key: string;
  };
  riot_api_key: string;
}

let config: Config;

export const getConfig = (env: Environment["Bindings"]) => {
  console.log(`getConfig`);
  console.log(env);
  if (config) {
    return config;
  }
  let envVars: EnvVarsSchemaType;
  try {
    envVars = envVarsSchema.parse(env);
  } catch (err) {
    if (env.ENV && env.ENV === "production") {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Invalid server configuration"
      );
    }
    if (err instanceof ZodError) {
      const errorMessage = generateZodErrorMessage(err);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessage);
    }
    throw err;
  }
  config = {
    env: envVars.ENV,
    database: {
      supabase_key: envVars.SUPABASE_KEY,
      supabase_url: envVars.SUPABASE_URL,
    },
    riot_api_key: env.RIOT_API_KEY,
  };
  return config;
};
