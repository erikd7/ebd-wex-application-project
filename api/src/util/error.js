import log from "./logger.js";
import { StatusCodes } from "http-status-codes";

const DEFAULT_CODE = StatusCodes.INTERNAL_SERVER_ERROR;
class ApiError extends Error {
  constructor(message, code = DEFAULT_CODE) {
    super(message);

    this.code = code;
  }
}

const errorMiddleware = (error, req, res, _next) => {
  log.error(error);

  res.status(error.code).json({ ok: false, message: error.message });
};

export { ApiError, errorMiddleware };
