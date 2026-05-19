import { z } from "zod";
import { ApiError } from "./error.js";
import { StatusCodes } from "http-status-codes";
import log from "./logger.js";

const validate = (schema, object) => {
  const result = schema.safeParse(object);

  if (!result.success) {
    log.debug("Schema validation error: " + z.prettifyError(result.error));

    throw new ApiError(
      JSON.stringify(z.flattenError(result.error)),
      StatusCodes.BAD_REQUEST
    );
  }

  return result.data;
};

export { validate };
