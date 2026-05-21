import { StatusCodes } from "http-status-codes";
import { Transaction } from "../domain/transaction.js";
import { ApiError } from "../util/error.js";

const storeTransaction = async (transactionInput) => {
  const transaction =
    await Transaction.validateAndBuildFromJson(transactionInput).save();

  return transaction.formatted();
};

const getTransactionInCurrency = async (id, countryCurrencyDesc) => {
  // Find transaction
  const transaction = await Transaction.find(id);

  if (!transaction) {
    throw new ApiError(
      `Transaction with ID ${id} not found`,
      StatusCodes.NOT_FOUND
    );
  }

  // Add specified currency, if provided
  if (countryCurrencyDesc) {
    await transaction.enrichWithCurrency(countryCurrencyDesc);
  }

  return transaction.formatted();
};

export { storeTransaction, getTransactionInCurrency };
