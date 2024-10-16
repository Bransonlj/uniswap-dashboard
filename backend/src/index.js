import express from "express";
import 'dotenv/config';
import cors from 'cors';
import mongoose from 'mongoose';
import transactionRouter from "./route/transaction.route.js";
import { recordLiveTransactions } from "./controller/transaction.controller.js";

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

// Set an interval to poll for new transactions every 30 seconds
const POLLING_INTERVAL = 30000;
let intervalId; // cleanup

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
      recordLiveTransactions('WETH-USDC');
      intervalId = setInterval(() => recordLiveTransactions('WETH-USDC'), POLLING_INTERVAL);
      app.listen(port, () => {
        console.log(
          `⚡️[server]: Server is running at http://localhost:${port}`
        );
      });
    }).catch(err => console.log(err.message))

