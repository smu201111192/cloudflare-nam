import { Options } from "ky";
import * as qs from "querystring";

export interface IParams {
  [key: string]: string | number;
}

export interface IBaseApiParams {
  /**
   * If api response is 429 (rate limits) try reattempt after needed time (default true)
   */
  rateLimitRetry?: boolean;
  /**
   * Number of time to retry after rate limit response (default 1)
   */
  rateLimitRetryAttempts?: number;
  /**
   * Riot games api key
   */
  key?: string;
  /**
   * Concurrency calls to riot (default infinity)
   * Concurrency per method (example: summoner api, match api, etc)
   */
  concurrency?: number;
  /**
   * Debug methods
   */
  debug?: {
    /**
     * Log methods execution time (default false)
     */
    logTime?: boolean;
    /**
     * Log urls (default false)
     */
    logUrls?: boolean;
    /**
     * Log when is waiting for rate limits (default false)
     */
    logRatelimits?: boolean;
  };
}

export function waiter(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function getUrlFromOptions(url: string, options: Options): string {
  let uri = url;
  if (options.searchParams) {
    uri += "?";
    //@ts-ignore
    uri += qs.stringify(options.searchParams);
  }
  return uri;
}
