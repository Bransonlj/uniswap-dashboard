import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  pool: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  blockNumber: {
    type: Number,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  ethFee: {
    type: Number,
    required: true,
  },
  usdtFee: {
    type: Number,
    required: true,
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema)

export default Transaction;