import request from "supertest";
import { describe, it, expect } from "vitest";

import app from "../app.js";

describe("transaction routes", () => {
  describe("POST /transaction", () => {
    it("returns 400", async () => {
      const response = await request(app).post("/transaction");

      expect(response.status).toBe(400);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toBe(
        JSON.stringify({
          formErrors: ["Invalid input: expected object, received undefined"],
          fieldErrors: {},
        }),
      );
    });
  });
});
