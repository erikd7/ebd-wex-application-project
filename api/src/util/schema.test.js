import { describe, it, expect } from "vitest";
import z from "zod";
import { StatusCodes } from "http-status-codes";
import { validate } from "./schema.js";

describe("schema utils", () => {
  describe("validate", () => {
    const testSchema = z.object({
      id: z.string().optional(),
      thing1: z.string(),
      thing2: z.number(),
      dateThing: z.date(),
    });
    const validObject = {
      id: "123",
      thing1: "test input",
      thing2: 789,
      dateThing: new Date(),
    };

    it("should successfully validate an object", () => {
      const result = validate(testSchema, validObject);

      expect(result).toMatchObject(validObject);
    });

    it("should throw bad request error on invalid object", () => {
      const invalidObject = { ...validObject, thing2: "abc" };

      expect(() => validate(testSchema, invalidObject)).toThrowError(
        expect.objectContaining({
          code: StatusCodes.BAD_REQUEST,
          message: JSON.stringify({
            formErrors: [],
            fieldErrors: {
              thing2: ["Invalid input: expected number, received string"],
            },
          }),
        }),
      );
    });
  });
});
