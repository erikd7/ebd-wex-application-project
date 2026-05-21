import { describe, it, expect, vi } from "vitest";
import { storeTransaction, getTransactionInCurrency } from "./transaction";
import { insertTransaction, findTransactionById } from "../db/transaction.js";
import { StatusCodes } from "http-status-codes";

vi.mock("../db/transaction.js", () => ({
  insertTransaction: vi.fn(),
  findTransactionById: vi.fn(),
}));

describe("transaction service", () => {
  describe("storeTransaction()", () => {
    it("should call the domain validation and saving function and return the saved transaction", async () => {
      const transactionInput = {
        description: "Test transaction",
        date: "2026-05-01",
        amount: 100.0,
      };
      const savedTransaction = {
        id: "173c98b7-8940-4d08-b97d-48e5992aec0f",
        ...transactionInput,
      };
      insertTransaction.mockResolvedValue([savedTransaction]);

      const result = await storeTransaction(transactionInput);

      expect(insertTransaction).toHaveBeenCalledWith(transactionInput);
      expect(result).toEqual(savedTransaction);
    });

    it("should pass API error encountered during save", async () => {
      const transactionInput = {
        description: "Test transaction",
        date: "2026-05-01",
        amount: 100.0,
      };

      insertTransaction.mockImplementationOnce(() => {
        throw new Error("API error during save");
      });

      expect(
        async () => await storeTransaction(transactionInput)
      ).rejects.toMatchObject({
        message: "API error during save",
      });
    });
  });

  describe("getTransactionInCurrency()", () => {
    const id = "173c98b7-8940-4d08-b97d-48e5992aec0f";
    const transaction = {
      id,
      description: "Test transaction",
      date: "2026-05-01",
      amount: 222.88,
    };
    //vi.spyOn(Transaction, "formatted").mockReturnValue(transaction);

    it("should throw bad request error when ID is invalid", async () => {
      findTransactionById.mockResolvedValue([transaction]);

      expect(
        async () => await getTransactionInCurrency("an invalid id")
      ).rejects.toMatchObject({
        message: '{"formErrors":["ID must be a valid UUID"],"fieldErrors":{}}',
        code: StatusCodes.BAD_REQUEST,
      });
    });

    it("should throw not found error when transaction is not found", async () => {
      findTransactionById.mockResolvedValue([]);

      expect(
        async () => await getTransactionInCurrency(id)
      ).rejects.toMatchObject({
        message: `Transaction with ID ${id} not found`,
        code: StatusCodes.NOT_FOUND,
      });
    });

    it("should call the domain function and return the transaction", async () => {
      findTransactionById.mockResolvedValue([transaction]);

      const result = await getTransactionInCurrency(id);

      expect(findTransactionById).toHaveBeenCalledWith(id);
      expect(result).toEqual(transaction);
    });
  });
});
