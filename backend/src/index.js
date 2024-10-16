import express from "express";
import 'dotenv/config';
import cors from 'cors';
import transactionRouter from "./route/transaction.route.js";

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

app.listen(port, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${port}`
  );
});
