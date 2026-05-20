import { describe, it, expect, vi } from "vitest";
import { Transaction } from "../domain/transaction.js";
import { StatusCodes } from "http-status-codes";
import { insertTransaction } from "../db/transaction.js";
import db from "./db.js";

vi.mock("./db.js", () => ({
  default: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  },
}));

describe("transaction query functions", () => {
  describe("insertTransaction()", () => {
    const transaction = new Transaction({
      description: "Test transaction",
      date: "2026-05-01",
      amount: 100.0,
    });
    const insertedTransaction = {
      id: "abc123",
      description: transaction.description,
      date: transaction.date,
      amount: transaction.amount,
    };

    it("should insert a transaction into the database and return the inserted transaction", async () => {
      db.returning.mockResolvedValueOnce([insertedTransaction]);

      const result = await insertTransaction(transaction);

      expect(db.insert).toHaveBeenCalled();
      expect(db.values).toHaveBeenCalledWith({
        description: transaction.description,
        date: transaction.date,
        amount: transaction.amount,
      });
      expect(db.returning).toHaveBeenCalled();

      expect(result).toEqual([insertedTransaction]);
    });

    it("should throw a clean error if the database query fails", async () => {
      db.insert.mockImplementationOnce(() => {
        throw new Error("database error and maybe some schema info");
      });

      expect(
        async () => await insertTransaction(transaction)
      ).rejects.toMatchObject({
        message: "Failed to insert transaction",
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });
});
