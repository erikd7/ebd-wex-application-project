import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
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

      expect(response.status).toBe(StatusCodes.CREATED);

      expect(response.body).toMatchObject({ id: expect.any(String), ...body });
    });
  });

  describe("GET /transaction", () => {
    let realId;
    const transactionToInsert = {
      description: "route testing transaction GET",
      amount: 999.99,
      date: "2026-05-02",
    };
    const randomId = "173c98b7-8940-4d08-b97d-48e5992aec0f";

    beforeAll(async () => {
      const response = await request(app)
        .post("/transaction")
        .send(transactionToInsert);
      if (response.status !== StatusCodes.CREATED) {
        throw new Error(
          `Failed to create transaction for GET /transaction route test in beforeAll: ${response.status} - ${JSON.stringify(response.body)}`
        );
      }
      realId = response.body.id;
    });

    it("returns 400 when ID is invalid", async () => {
      const response = await request(app).get(`/transaction/not-a-valid-id`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.error).toBe(ReasonPhrases.BAD_REQUEST);
      expect(response.body.message).toBe(
        '{"formErrors":["ID must be a valid UUID"],"fieldErrors":{}}'
      );
    });

    it("returns 400 when currency is invalid", async () => {
      const response = await request(app).get(
        `/transaction/${realId}?countryCurrencyDesc=123123`
      );

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.error).toBe(ReasonPhrases.BAD_REQUEST);
      expect(response.body.message).toBe(
        '{"formErrors":["countryCurrencyDesc must be in the format \'Country-Currency\', e.g. \'Canada-Dollar\'"],"fieldErrors":{}}'
      );
    });

    it("returns 404 when transaction is not found", async () => {
      const response = await request(app).get(`/transaction/${randomId}`);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.error).toBe(ReasonPhrases.NOT_FOUND);
      expect(response.body.message).toBe(
        `Transaction with ID ${randomId} not found`
      );
    });

    it("returns 200 when transaction is found", async () => {
      const response = await request(app).get(`/transaction/${realId}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toMatchObject({
        ...transactionToInsert,
        id: realId,
      });
    });

    it("returns a 422 when exchange rate for country-currency description is not found", async () => {
      const countryCurrencyDesc = "Schrute-Buck";

      const response = await request(app).get(
        `/transaction/${realId}?countryCurrencyDesc=${countryCurrencyDesc}`
      );

      expect(response.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(response.body).toMatchObject({
        error: "Unprocessable Entity",
        message: `No exchange rate found for currency ${countryCurrencyDesc} within 6 months before transaction date 2026-05-02. Ensure your countryCurrencyDesc matches a Country-Currency from the Treasury Reporting Rates of Exchange API, e.g. "Canada-Dollar".`,
      });
    });

    it.each([
      ["Afghanistan-Afghani", 64769.35],
      ["Canada-Dollar", 1392.99],
      ["Mexico-Peso", 18027.82],
    ])(
      "returns 200 with currency converted to %s in amount %s",
      async (countryCurrencyDesc, expectedAmount) => {
        const response = await request(app).get(
          `/transaction/${realId}?countryCurrencyDesc=${countryCurrencyDesc}`
        );

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toMatchObject({
          ...transactionToInsert,
          id: realId,
          currencies: {
            [countryCurrencyDesc]: {
              exchangeRate: expect.any(Number),
              convertedAmount: expectedAmount,
            },
          },
        });
      }
    );
  });
});
