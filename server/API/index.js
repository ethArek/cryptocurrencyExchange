const router = require("express").Router();

const { mongoose } = require("../db/mongoose.js");

router.use("/users", require("./users/index.js"));
router.use(
  "/administration/cryptocurrencies",
  require("./administration/cryptocurrencies/index.js")
);

router.get("/", (req, res) => {
  res.send("spoczko");
});

module.exports = router;
