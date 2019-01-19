const router = require("express").Router();

const { Transaction } = require("../../models/transactions.js");
const { CryptoCurrency } = require("../../models/cryptocurrency.js");

router.post("/getTransactions", async (req, res) => {
  try {
    const cryptocurrency = await CryptoCurrency.findOne({
      ticker: req.body.ticker
    });

    const transactions = await Transaction.find({
      cryptocurrency_id: cryptocurrency._id
    });
    let resultArray = [];
    transactions.forEach(transaction => {
      resultArray.push({
        price: transaction.price,
        date: transaction.date
      });
    });

    res.json(resultArray);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
