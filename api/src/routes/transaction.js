import { Router } from "express";
import {
  storeTransaction,
  getTransactionInCurrency,
} from "../services/transaction.js";
import { StatusCodes } from "http-status-codes";

const router = Router();

// Create a new transaction
router.post("/transaction", async (req, res, next) => {
  try {
    const transaction = await storeTransaction(req.body);

    res.status(StatusCodes.CREATED).json(transaction);
  } catch (error) {
    next(error);
  }
});

// Retrieve an existing transaction, optionally with converted currency
router.get("/transaction/:id", async (req, res, next) => {
  try {
    const transaction = await getTransactionInCurrency(
      req.params.id,
      req.query.countryCurrencyDesc
    );

    res.status(StatusCodes.OK).json(transaction);
  } catch (error) {
    next(error);
  }
});

export default router;
