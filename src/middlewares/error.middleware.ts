import type { ErrorHandler } from "hono";
import { StatusCode } from "hono/utils/http-status";
import httpStatus from "http-status";

import { Environment } from "../binding.types";
import { ApiError } from "../utils/ApiError";
import { generateZodErrorMessage } from "../utils/zod";

const genericJSONErrMsg = "Unexpected end of JSON input";

// export const errorConverter = (err: unknown, sentry: Toucan): ApiError => {
//   let error = err
//   if (error instanceof ZodError) {
//     const errorMessage = generateZodErrorMessage(error)
//     error = new ApiError(httpStatus.BAD_REQUEST, errorMessage)
//   } else if (error instanceof SyntaxError && error.message.includes(genericJSONErrMsg)) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid JSON payload')
//   } else if (!(error instanceof ApiError)) {
//     const castedErr = (typeof error === 'object' ? error : {}) as Record<string, unknown>
//     const statusCode: number =
//       typeof castedErr.statusCode === 'number'
//         ? castedErr.statusCode
//         : httpStatus.INTERNAL_SERVER_ERROR
//     const message = (castedErr.description || castedErr.message || httpStatus[statusCode]) as string
//     if (statusCode >= 500) {
//       // Log any unhandled application error
//       sentry.captureException(error)
//     }
//     error = new ApiError(statusCode, message, false)
//   }
//   return error as ApiError
// }

export const convertError = (e: unknown) => {
  let error = e;
  if (error instanceof SyntaxError) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON");
  }
  return error as ApiError;
};

//@ts-ignore
export const errorHandler: ErrorHandler<Environment> = async (e, c) => {
  // Can't load config in case error is inside config so load env here and default
  // to highest obscurity aka production if env is not set
  const env = c.env.ENV || "production";
  //   const sentry = getSentry(c);
  const error = convertError(e);
  console.log(error);

  if (env === "production") {
    error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    error.message = "internal server error";
  }
  console.log(c.env.ENV);
  const response = {
    code: error.statusCode,
    message: error.message,
    ...(env === "development" && { stack: e.stack }),
  };
  delete c.error;
  // Don't pass to sentry middleware as it is either logged or already handled

  return c.json(response, error.statusCode as StatusCode);
};
