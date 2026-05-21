import { describe, it, expect, vi } from "vitest";
import { Transaction } from "../domain/transaction.js";
import { StatusCodes } from "http-status-codes";
import { insertTransaction, findTransactionById } from "../db/transaction.js";
import db from "./db.js";

vi.mock("./db.js", () => ({
  default: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),

    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
  },
}));

describe("transaction query functions", () => {
  const transaction = new Transaction({
    description: "Test transaction",
    date: "2026-05-01",
    amount: 100.0,
  });
  const jsonTransaction = {
    id: "173c98b7-8940-4d08-b97d-48e5992aec0f",
    description: transaction.description,
    date: transaction.date,
    amount: transaction.amount,
  };

  describe("insertTransaction()", () => {
    it("should insert a transaction into the database and return the inserted transaction", async () => {
      db.returning.mockResolvedValueOnce([jsonTransaction]);

      const result = await insertTransaction(transaction);

      expect(db.insert).toHaveBeenCalled();
      expect(db.values).toHaveBeenCalledWith({
        description: transaction.description,
        date: transaction.date,
        amount: transaction.amount,
      });
      expect(db.returning).toHaveBeenCalled();

      expect(result).toEqual([jsonTransaction]);
    });

    it("should throw a clean error if the database query fails", async () => {
      db.insert.mockImplementationOnce(() => {
        throw new Error("database error and maybe some schema info");
      });

      await expect(
        async () => await insertTransaction(transaction)
      ).rejects.toMatchObject({
        message: "Failed to insert transaction",
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("findTransactionById()", () => {
    it("should query the database for a transaction with the given ID and return it", async () => {
      db.limit.mockResolvedValueOnce(jsonTransaction);

      const result = await findTransactionById(jsonTransaction.id);

      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(db.limit).toHaveBeenCalledWith(1);

      expect(result).toEqual(jsonTransaction);
    });

    it("should throw a clean error if the database query fails", async () => {
      db.select.mockImplementationOnce(() => {
        throw new Error("database error and maybe some schema info");
      });

      await expect(
        async () => await findTransactionById(jsonTransaction.id)
      ).rejects.toMatchObject({
        message: "Failed to search for transaction",
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });
});
