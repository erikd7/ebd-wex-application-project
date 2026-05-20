import { Router } from "express";
import { storeTransaction } from "../services/transaction.js";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.post("/transaction", async (req, res, next) => {
  try {
    const transaction = await storeTransaction(req.body);

    res.status(StatusCodes.CREATED).json(transaction);
  } catch (error) {
    next(error);
  }
});

export default router;
