import express from "express";
import { getManyTransactions } from "../controller/transaction.controller.js";

const transactionRouter = express.Router();

transactionRouter.get("/", getManyTransactions);

export default transactionRouter;