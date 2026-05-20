import { z } from "zod";
import { validate } from "../util/schema.js";
import { insertTransaction } from "../db/transaction.js";

const idSchema = z.string("ID must be a string");
const DESCRIPTION_MAX_LENGTH = 50;
const descriptionSchema = z
  .string("Description must be a string")
  .max(DESCRIPTION_MAX_LENGTH, "Description must not exceed 50 characters");
const dateSchema = z
  .string("Transaction date must be a valid date in YYYY-MM-DD format")
  .date("Transaction date must be a valid date in YYYY-MM-DD format");
const amountSchema = z
  .number("Transaction amount must be a number")
  .positive("Transaction amount must be positive")
  .refine(
    (value) => Number(value.toFixed(2)) === value,
    "Transaction amount must be rounded to the nearest cent"
  );
const transactionSchema = z.object({
  id: idSchema.optional(),
  description: descriptionSchema,
  date: dateSchema,
  amount: amountSchema,
});

class Transaction {
  id;
  description;
  date;
  amount;

  constructor({ id, description, date, amount }) {
    this.id = id;
    this.description = description;
    this.date = date;
    this.amount = amount;
  }

  static buildFromJson({ description, date, amount }) {
    return new Transaction({ description, date, amount });
  }

  static buildFromDb({ id, description, date, amount }) {
    return new Transaction({
      id,
      description,
      date,
      amount: parseFloat(amount),
    });
  }

  static validateJson(input) {
    validate(transactionSchema, input);
  }

  static validateAndBuildFromJson(input) {
    this.validateJson(input);
    return this.buildFromJson(input);
  }

  async save() {
    const result = await insertTransaction(this);

    return Transaction.buildFromDb(result[0]);
  }

  formatted() {
    return {
      id: this.id,
      description: this.description,
      date: this.date,
      amount: this.amount,
    };
  }
}

export { Transaction };
