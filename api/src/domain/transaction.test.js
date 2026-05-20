import { describe, it, expect, beforeEach, vi } from "vitest";
import { Transaction } from "./transaction.js";
import { StatusCodes } from "http-status-codes";
import { insertTransaction } from "../db/transaction.js";

vi.mock("../db/transaction.js", () => ({
  insertTransaction: vi.fn(),
}));

describe("transaction domain", () => {
  describe("Transaction model", () => {
    let transaction;
    const id = "abc",
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
        ["id", "ID must be a string"],
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
  });
});
