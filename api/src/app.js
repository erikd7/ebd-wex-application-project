import express from "express";
import { httpLog } from "./util/logger.js";

// Basic setup
const env = process.env.NODE_ENV || "dev";

// Express setup
const app = express();
app.use(httpLog);
app.use(express.json());

export default app;
