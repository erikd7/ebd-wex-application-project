import { StatusCodes } from "http-status-codes";
import { Transaction } from "../domain/transaction.js";
import { ApiError } from "../util/error.js";

const storeTransaction = async (transactionInput) => {
  const transaction =
    await Transaction.validateAndBuildFromJson(transactionInput).save();

  return transaction.formatted();
};

const getTransactionInCurrency = async (id) => {
  //Find transaction
  const transaction = await Transaction.find(id);

  if (!transaction) {
    throw new ApiError(
      `Transaction with ID ${id} not found`,
      StatusCodes.NOT_FOUND
    );
  }

  return transaction.formatted();
};

export { storeTransaction, getTransactionInCurrency };
