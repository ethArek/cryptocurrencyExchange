const mongoose = require("mongoose");
const validator = require("validator");
const _ = require("lodash");

const ObjectId = mongoose.Schema.Types.ObjectId;

const OrderSchema = new mongoose.Schema({
  isBuyOrder: {
    type: Boolean,
    required: true //true - buyOrder, false - sellOrder
  },
  cryptocurrency_id: {
    type: ObjectId,
    required: true
  },
  user_id: {
    type: ObjectId,
    required: true
  },
  openedAt: {
    type: Date,
    required: true
  },
  closed: [
    {
      amount: {
        type: Number,
        required: true
      },
      date: {
        type: Date
      }
    }
  ],
  amount: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false,
    required: true
  }
});

const Order = mongoose.model("orders", OrderSchema);

module.exports = { Order };
