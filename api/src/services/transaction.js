import { Transaction } from "../domain/transaction.js";

const storeTransaction = async (transactionInput) => {
  const transaction =
    await Transaction.validateAndBuildFromJson(transactionInput).save();

  return transaction.formatted();
};

export { storeTransaction };
