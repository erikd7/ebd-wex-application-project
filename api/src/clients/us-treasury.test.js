import { describe, it, expect, vi } from "vitest";
import { StatusCodes } from "http-status-codes";
import {
  getMostRecentExchangeRateForCountryCurrencyDesc,
  retrieveReportingRatesOfExchange,
} from "../clients/us-treasury.js";

describe("us-treasury client", () => {
  const mockedExchangeRates = [
    {
      effective_date: "2026-05-01",
      exchange_rate: 77.5,
    },
    {
      effective_date: "2026-04-01",
      exchange_rate: 77.0,
    },
  ];
  const countryCurrencyDesc = "Afghanistan-Afghani";
  const fromDateString = "2026-01-01";
  const toDateString = "2026-06-01";

  describe("retrieveReportingRatesOfExchange()", () => {
    it("should correctly build the request and return exchange rates", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockedExchangeRates }),
      });

      const result = await retrieveReportingRatesOfExchange(
        countryCurrencyDesc,
        fromDateString,
        toDateString
      );

      // Correct fields
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("fields=effective_date,exchange_rate")
      );
      // Correct country-currency filter
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `filter=country_currency_desc:eq:${countryCurrencyDesc}`
        )
      );
      // Correct effective date filters
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `effective_date:gte:${fromDateString},effective_date:lte:${toDateString}`
        )
      );
      // Correct sorting
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`sort=-effective_date`)
      );

      //Correct exchange rates returned
      expect(result).toBe(mockedExchangeRates);
    });

    it("should throw error if response is not ok", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: "mocked error",
        json: async () => ({ data: "some more error info" }),
      });

      await expect(
        async () =>
          await retrieveReportingRatesOfExchange(
            countryCurrencyDesc,
            fromDateString,
            toDateString
          )
      ).rejects.toMatchObject({
        message:
          "An error occurred while retrieving reporting rates of exchange",
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });

    it("should gracefully handle fetch error", async () => {
      global.fetch = vi.fn().mockImplementation(() => {
        throw Error("mocked fetch error");
      });

      await expect(
        async () =>
          await retrieveReportingRatesOfExchange(
            countryCurrencyDesc,
            fromDateString,
            toDateString
          )
      ).rejects.toMatchObject({
        message:
          "An error occurred while retrieving reporting rates of exchange",
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("getMostRecentExchangeRateForCountryCurrencyDesc()", () => {
    it("should return the most recent exchange rate when retrieve function succeeds", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockedExchangeRates }),
      });

      const result = await getMostRecentExchangeRateForCountryCurrencyDesc(
        countryCurrencyDesc,
        fromDateString,
        toDateString
      );

      expect(result).toBe(mockedExchangeRates[0].exchange_rate);
    });

    it("should return undefined when no exchange rates are returned from retrieve function", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const result = await getMostRecentExchangeRateForCountryCurrencyDesc(
        countryCurrencyDesc,
        fromDateString,
        toDateString
      );

      expect(result).toBeUndefined();
    });
  });
});
