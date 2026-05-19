import express from "express";
import { httpLog } from "./util/logger.js";

// Express setup
const app = express();
app.use(httpLog);
app.use(express.json());

export default app;
