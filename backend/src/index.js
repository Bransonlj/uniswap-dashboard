import express from "express";
import 'dotenv/config';
import cors from 'cors';
import mongoose from 'mongoose';
import transactionRouter from "./route/transaction.route.js";
import { fetchAndSaveLiveTransactions } from "./controller/transaction.controller.js";

const app = express();

const port = process.env.PORT || 5000

app.use(cors({
  origin: "*",
}));
app.use(express.json());

// middleware to log to console
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
}); 

app.use("/api/transactions", transactionRouter);

// Set an interval to poll the external API every X milliseconds
const POLLING_INTERVAL = 30000; // 0.5 minute
let intervalId;

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
      fetchAndSaveLiveTransactions('WETH-USDC');
      intervalId = setInterval(() => fetchAndSaveLiveTransactions('WETH-USDC'), POLLING_INTERVAL);
      app.listen(port, () => {
        console.log(
          `⚡️[server]: Server is running at http://localhost:${port}`
        );
      });
    }).catch(err => console.log(err.message))

