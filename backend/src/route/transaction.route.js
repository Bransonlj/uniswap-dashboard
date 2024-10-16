import express from "express";
import { getLiveTransactions, getManyTransactions, getPrice } from "../controller/transaction.controller.js";

const transactionRouter = express.Router();

transactionRouter.get("/", getManyTransactions);

transactionRouter.get("/price", getPrice);

transactionRouter.get("/live", getLiveTransactions);

export default transactionRouter;