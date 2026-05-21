import { z } from "zod";
import { validate } from "../util/schema.js";
import { insertTransaction, findTransactionById } from "../db/transaction.js";
import { getMostRecentExchangeRateForCountryCurrencyDesc } from "../clients/us-treasury.js";
import { sixMonthsAgo } from "../util/date.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../util/error.js";

const idSchema = z
  .string("ID must be a valid UUID")
  .uuid("ID must be a valid UUID");
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
const countryCurrencyDescSchema = z
  .string("countryCurrencyDesc must be a string")
  .refine(
    (value) => value.split("-").length === 2,
    "countryCurrencyDesc must be in the format 'Country-Currency', e.g. 'Canada-Dollar'"
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
  currencies;

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

  static async find(id) {
    validate(idSchema, id);

    const result = await findTransactionById(id);

    if (result?.length) {
      return this.buildFromDb(result[0]);
    }
  }

  async save() {
    const result = await insertTransaction(this);

    return Transaction.buildFromDb(result[0]);
  }

  async getCurrencyConversion(countryCurrencyDesc) {
    validate(countryCurrencyDescSchema, countryCurrencyDesc);

    const sixMonthsBefore = sixMonthsAgo(this.date);

    const exchangeRate = await getMostRecentExchangeRateForCountryCurrencyDesc(
      countryCurrencyDesc,
      sixMonthsBefore, // from date is 6 months before the transaction date
      this.date // to date is the transaction date (exchange rate should be the most recent one before the transaction date within a 6 month window)
    );

    if (exchangeRate) {
      return {
        exchangeRate: parseFloat(exchangeRate),
        convertedAmount: Math.round(this.amount * exchangeRate * 100) / 100,
      };
    }
  }

  async enrichWithCurrency(countryCurrencyDesc) {
    const currencyConversion =
      await this.getCurrencyConversion(countryCurrencyDesc);

    if (!currencyConversion) {
      throw new ApiError(
        `No exchange rate found for currency ${countryCurrencyDesc} within 6 months before transaction date ${this.date}. Ensure your countryCurrencyDesc matches a Country-Currency from the Treasury Reporting Rates of Exchange API, e.g. "Canada-Dollar".`,
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    this.currencies = {
      [countryCurrencyDesc]: currencyConversion,
    };
  }

  formatted() {
    return {
      id: this.id,
      description: this.description,
      date: this.date,
      amount: this.amount,
      currencies: this.currencies,
    };
  }
}

export { Transaction };
