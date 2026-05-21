import { describe, it, expect, beforeEach, vi } from "vitest";
import { Transaction } from "./transaction.js";
import { StatusCodes } from "http-status-codes";
import { insertTransaction, findTransactionById } from "../db/transaction.js";
import { getMostRecentExchangeRateForCountryCurrencyDesc } from "../clients/us-treasury.js";

vi.mock("../db/transaction.js", () => ({
  insertTransaction: vi.fn(),
  findTransactionById: vi.fn(),
}));

vi.mock("../clients/us-treasury.js", () => ({
  getMostRecentExchangeRateForCountryCurrencyDesc: vi.fn(),
}));

describe("transaction domain", () => {
  describe("Transaction model", () => {
    let transaction;
    const id = "173c98b7-8940-4d08-b97d-48e5992aec0f",
      description = "test description",
      date = "2026-05-01",
      amount = 150.12;
    const transactionObject = { id, description, date, amount };

    beforeEach(() => {
      transaction = new Transaction(transactionObject);
    });

    it("instantiates a transaction with an id, a description, a date, and an amount", () => {
      expect(transaction.id).toBe(id);
      expect(transaction.description).toBe(description);
      expect(transaction.date).toBe(date);
      expect(transaction.amount).toBe(amount);
    });

    describe("validateJson()", () => {
      it("should correctly validate a transaction", () => {
        expect(() => Transaction.validateJson(transactionObject)).not.toThrow();

        // Without optional ID
        expect(() =>
          Transaction.validateJson({ description, date, amount })
        ).not.toThrow();
      });

      it.each([
        ["id", "ID must be a valid UUID"],
        ["description", "Description must be a string"],
        [
          "description",
          "Description must not exceed 50 characters",
          "a".repeat(51),
        ],
        [
          "date",
          "Transaction date must be a valid date in YYYY-MM-DD format",
          new Date(),
        ],
        [
          "date",
          "Transaction date must be a valid date in YYYY-MM-DD format",
          "01-01-2026",
        ],
        [
          "date",
          "Transaction date must be a valid date in YYYY-MM-DD format",
          "fake date",
        ],
        ["amount", "Transaction amount must be a number"],
        ["amount", "Transaction amount must be positive", -5],
        [
          "amount",
          "Transaction amount must be rounded to the nearest cent",
          1.001,
        ],
      ])(
        "should throw bad request when %s is invalid",
        (invalidKey, errorMessage, invalidValue = false) => {
          const invalidTransactionObject = {
            ...transactionObject,
            [invalidKey]: invalidValue,
          };

          expect(() =>
            Transaction.validateJson(invalidTransactionObject)
          ).toThrowError(
            expect.objectContaining({
              code: StatusCodes.BAD_REQUEST,
              message: expect.stringContaining(errorMessage),
            })
          );
        }
      );
    });

    describe("buildFromJson()", () => {
      it("should build a transaction from a plain object", () => {
        expect(Transaction.buildFromJson(transactionObject)).toBeInstanceOf(
          Transaction
        );
      });
    });

    describe("buildFromDb()", () => {
      it("should build a transaction from a database object with ID and number", () => {
        const transaction = Transaction.buildFromDb({
          ...transactionObject,
          amount: amount.toString(),
        });

        expect(transaction).toBeInstanceOf(Transaction);
        expect(transaction.id).toBeDefined();
        expect(transaction.amount).toEqual(expect.any(Number));
      });
    });

    describe("validateAndBuildFromJson()", () => {
      it("should build a transaction from a valid plain object", () => {
        expect(
          Transaction.validateAndBuildFromJson(transactionObject)
        ).toBeInstanceOf(Transaction);
      });

      it("should throw an error when an invalid object is passed", () => {
        expect(() => Transaction.validateAndBuildFromJson({})).toThrow();
      });
    });

    describe("save()", () => {
      it("should call insertTransaction with the transaction data", async () => {
        insertTransaction.mockResolvedValueOnce([transactionObject]);

        const result = await transaction.save();

        expect(insertTransaction).toHaveBeenCalledWith(transaction);
        expect(result).toBeInstanceOf(Transaction);
        expect(result.id).toBe(transactionObject.id);
      });
    });

    describe("find()", () => {
      it("should throw error when ID is invalid", async () => {
        await expect(Transaction.find("invalid-id")).rejects.toThrow(
          "ID must be a valid UUID"
        );
      });

      it("should return a transaction when found", async () => {
        findTransactionById.mockResolvedValueOnce([transactionObject]);

        const result = await Transaction.find(id);

        expect(findTransactionById).toHaveBeenCalledWith(id);
        expect(result).toBeInstanceOf(Transaction);
        expect(result.id).toBe(transactionObject.id);
      });

      it("should return undefined when transaction is not found", async () => {
        findTransactionById.mockResolvedValueOnce([]);

        const result = await Transaction.find(id);

        expect(findTransactionById).toHaveBeenCalledWith(id);
        expect(result).toBeUndefined();
      });
    });

    describe("getCurrencyConversion()", () => {
      it("should throw error when countryCurrencyDesc is invalid", async () => {
        await expect(
          transaction.getCurrencyConversion("not a country currency desc")
        ).rejects.toThrow(
          "countryCurrencyDesc must be in the format 'Country-Currency', e.g. 'Canada-Dollar'"
        );
      });

      it("should return the amount multiplied by the exchange rate for the specified currency", async () => {
        const mockedExchangeRate = 10;
        getMostRecentExchangeRateForCountryCurrencyDesc.mockResolvedValue(
          mockedExchangeRate
        );

        const result = await transaction.getCurrencyConversion("Canada-Dollar");

        expect(
          getMostRecentExchangeRateForCountryCurrencyDesc
        ).toHaveBeenCalledWith(
          "Canada-Dollar",
          expect.any(String),
          expect.any(String)
        );
        expect(result).toMatchObject({
          exchangeRate: parseFloat(mockedExchangeRate),
          convertedAmount:
            Math.round(transaction.amount * mockedExchangeRate * 100) / 100,
        });
      });

      it("should return undefined if no exchange rate is found for the specified currency", async () => {
        getMostRecentExchangeRateForCountryCurrencyDesc.mockResolvedValue(
          undefined
        );

        const result = await transaction.getCurrencyConversion("Canada-Dollar");

        expect(result).toBeUndefined();
      });
    });

    describe("enrichWithCurrency()", () => {
      it("should enrich the transaction with the amount in the specified currency", async () => {
        const mockedExchangeRate = 10;
        getMostRecentExchangeRateForCountryCurrencyDesc.mockResolvedValue(
          mockedExchangeRate
        );

        await transaction.enrichWithCurrency("Canada-Dollar");

        expect(transaction.currencies).toEqual({
          "Canada-Dollar": {
            exchangeRate: parseFloat(mockedExchangeRate),
            convertedAmount:
              Math.round(transaction.amount * mockedExchangeRate * 100) / 100,
          },
        });
      });

      it("should throw an error if no exchange rate is found for the specified currency", async () => {
        getMostRecentExchangeRateForCountryCurrencyDesc.mockResolvedValue(
          undefined
        );

        await expect(
          transaction.enrichWithCurrency("Canada-Dollar")
        ).rejects.toMatchObject({
          message: `No exchange rate found for currency Canada-Dollar within 6 months before transaction date ${transaction.date}. Ensure your countryCurrencyDesc matches a Country-Currency from the Treasury Reporting Rates of Exchange API, e.g. "Canada-Dollar".`,
          code: StatusCodes.UNPROCESSABLE_ENTITY,
        });
      });
    });
  });
});
