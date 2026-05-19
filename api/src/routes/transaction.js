import { Router } from "express";
import { storeTransaction } from "../domain/transaction.js";

const router = Router();

router.post("/transaction", async (req, res) => {
  const transaction = storeTransaction(req.body);
  res.status(200).json({ ok: true, transaction });
});

export default router;
