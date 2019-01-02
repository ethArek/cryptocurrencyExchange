const mongoose = require("mongoose");
const validator = require("validator");
const _ = require("lodash");

const ObjectId = mongoose.Schema.Types.ObjectId;

const CryptoCurrencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  ticker: {
    type: String,
    required: true
  }
});
const CryptoCurrency = mongoose.model("cryptocurrencies", CryptoCurrencySchema);

module.exports = { CryptoCurrency };
