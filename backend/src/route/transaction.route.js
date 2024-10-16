import express from "express";
import { getManyTransactions, getPrice } from "../controller/transaction.controller.js";

const transactionRouter = express.Router();

transactionRouter.get("/", getManyTransactions);

transactionRouter.get("/price", getPrice);

export default transactionRouter;