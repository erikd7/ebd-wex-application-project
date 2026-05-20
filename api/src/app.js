import "./util/env.js";
import express from "express";
import { httpLog, loggingMiddleware } from "./util/logger.js";
import transactionRoutes from "./routes/transaction.js";
import { errorMiddleware } from "./util/error.js";

// Express setup
const app = express();
app.use(express.json());

// Logging
app.use(httpLog);
app.use(loggingMiddleware);

// Routes
app.use(transactionRoutes);

// Error handling
app.use(errorMiddleware);

export default app;
