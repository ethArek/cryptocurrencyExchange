const mongoose = require("mongoose");
const _ = require("lodash");

const ObjectId = mongoose.Schema.Types.ObjectId;

const TransactionSchema = new mongoose.Schema({
  cryptocurrency_id: {
    type: ObjectId,
    required: true
  },
  date: {
    type: Date
  },
  price: {
    type: Number,
    required: true
  }
});
const Transaction = mongoose.model("transactions", TransactionSchema);

module.exports = { Transaction };
