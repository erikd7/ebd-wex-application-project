import express from "express";

// Basic setup
const env = process.env.NODE_ENV || "dev";

// Express setup
const app = express();
app.use(express.json());

export default app;
