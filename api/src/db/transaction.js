import { transactionsTable } from "./schema.js";
import db from "./db.js";
import { eq } from "drizzle-orm";
import log from "../util/logger.js";
import { ApiError } from "../util/error.js";
import { StatusCodes } from "http-status-codes";

const insertTransaction = async (transaction) => {
  try {
    return db
      .insert(transactionsTable)
      .values({
        description: transaction.description,
        date: transaction.date,
        amount: transaction.amount,
      })
      .returning();
  } catch (error) {
    log.error(error);

    throw new ApiError(
      "Failed to insert transaction",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const findTransactionById = async (id) => {
  try {
    return db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, id))
      .limit(1);
  } catch (error) {
    log.error(error);

    throw new ApiError(
      "Failed to search for transaction",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export { insertTransaction, findTransactionById };
