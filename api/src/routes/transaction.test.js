import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

describe("transaction routes", () => {
  describe("POST /transaction", () => {
    it("returns 400", async () => {
      const response = await request(app).post("/transaction");

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);

      expect(response.body.error).toBe(ReasonPhrases.BAD_REQUEST);
      expect(response.body.message).toBe(
        JSON.stringify({
          formErrors: ["Invalid input: expected object, received undefined"],
          fieldErrors: {},
        })
      );
    });

    it("returns 201 with ID", async () => {
      const body = {
        description: "route testing transaction",
        amount: 123.45,
        date: "2026-05-01",
      };
      const response = await request(app).post("/transaction").send(body);

      expect(response.status).toBe(201);

      expect(response.body).toMatchObject({ id: expect.any(String), ...body });
    });
  });
});
