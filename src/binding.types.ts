export type Environment = {
  Bindings: {
    ENV: string;
    RIOT_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    MY_BUCKET: R2Bucket;
    MY_KV: KVNamespace;
  };
  Variables: {};
};
