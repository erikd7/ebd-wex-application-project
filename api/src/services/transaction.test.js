import { describe, it, expect, vi } from "vitest";
import { storeTransaction } from "./transaction";
import { Transaction } from "../domain/transaction";

vi.mock("../domain/transaction.js", () => ({
  Transaction: {
    validateAndBuildFromJson: vi.fn().mockReturnThis(),
    save: vi.fn().mockReturnThis(),
    formatted: vi.fn().mockReturnValue({
      id: "abc123",
      description: "Test transaction",
      date: "2026-05-01",
      amount: 100.0,
    }),
  },
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
        id: "abc123",
        ...transactionInput,
      };

      const result = await storeTransaction(transactionInput);

      expect(Transaction.validateAndBuildFromJson).toHaveBeenCalledWith(
        transactionInput
      );
      expect(Transaction.save).toHaveBeenCalled();
      expect(result).toEqual(savedTransaction);
    });

    it("should pass API error encountered during save", async () => {
      const transactionInput = {
        description: "Test transaction",
        date: "2026-05-01",
        amount: 100.0,
      };

      Transaction.save.mockImplementationOnce(() => {
        throw new Error("API error during save");
      });

      expect(
        async () => await storeTransaction(transactionInput)
      ).rejects.toMatchObject({
        message: "API error during save",
      });
    });
  });
});
