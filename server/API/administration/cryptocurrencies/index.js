const router = require("express").Router();
const _ = require("lodash");

const { CryptoCurrency } = require("../../../models/cryptocurrency.js");
const { mongoose } = require("../../../db/mongoose.js");

router.get("/", (req, res) => {
  res.send("tez dziala");
});

router.post("/add", async (req, res) => {
  try {
    const body = _.pick(req.body, ["name", "ticker"]);
    const cryptocurrency = new CryptoCurrency(body);

    await cryptocurrency.save();
    res.json();
  } catch (err) {
    console.log(err);
    res.status(500).json();
  }
});

module.exports = router;
