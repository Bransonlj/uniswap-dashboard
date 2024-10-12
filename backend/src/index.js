import express from "express";
import 'dotenv/config';

const app = express();

const port = process.env.PORT || 5000

app.use(express.json());

app.listen(port, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${port}`
  );
});