import { describe, it, expect, vi } from "vitest";
import { StatusCodes } from "http-status-codes";
import { ApiError, errorMiddleware } from "./error";

describe("error utils", () => {
  describe("ApiError", () => {
    it("creates an ApiError with message and code", () => {
      const error = new ApiError(
        "Something went wrong",
        StatusCodes.BAD_REQUEST
      );

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe("Something went wrong");
      expect(error.code).toBe(StatusCodes.BAD_REQUEST);
    });

    it("defaults to internal server error code if not provided", () => {
      const error = new ApiError("Something went wrong");

      expect(error.code).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it("creates an ApiError from a generic error", () => {
      const genericError = new Error("A generic error occurred");
      const apiError = ApiError.from(genericError, StatusCodes.BAD_REQUEST);

      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.message).toBe(genericError.message);
      expect(apiError.code).toBe(StatusCodes.BAD_REQUEST);
      expect(apiError.cause).toBe(genericError);
    });
  });

  describe("errorMiddleware", () => {
    it("creates API error from generic error", () => {
      vi.spyOn(ApiError, "from");

      const error = new Error("something bad happened");

      const req = {},
        res = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        };

      errorMiddleware(error, req, res);

      expect(ApiError.from).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR
      );
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      });
    });

    it("overrides internal server error to generic message", () => {
      const error = new Error("something bad happened with details");
      error.code = StatusCodes.INTERNAL_SERVER_ERROR;

      const req = {},
        res = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        };

      errorMiddleware(error, req, res);

      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR
      );
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      });
    });

    it("returns non-generic error message for non-internal server errors", () => {
      const error = new Error("something bad happened with details");
      error.code = StatusCodes.BAD_REQUEST;

      const req = {},
        res = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        };

      errorMiddleware(error, req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: "Bad Request",
        message: "something bad happened with details",
      });
    });
  });
});
