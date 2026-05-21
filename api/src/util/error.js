import log from "./logger.js";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

const DEFAULT_CODE = StatusCodes.INTERNAL_SERVER_ERROR;
class ApiError extends Error {
  constructor(message, code = DEFAULT_CODE, options = {}) {
    super(message, options);

    this.code = code;
  }

  static from(error, code) {
    const apiError = new ApiError(error.message, code, {
      cause: error,
    });

    apiError.stack = error.stack;

    Object.assign(apiError, error);

    return apiError;
  }
}

const errorMiddleware = (error, req, res, _next) => {
  log.error(error);

  // Make ApiError if it isn't one already
  if (!(error instanceof ApiError)) {
    error = ApiError.from(error);
  }

  // Don't send internal error messages
  if (error.code === StatusCodes.INTERNAL_SERVER_ERROR) {
    log.debug(
      `Overriding error message for internal server error. Original message: ${error.message}`
    );
    error.message = "An unexpected error occurred";
  }

  res
    .status(error.code)
    .json({ error: getReasonPhrase(error.code), message: error.message });
};

export { ApiError, errorMiddleware };
