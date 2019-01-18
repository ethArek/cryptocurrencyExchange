const router = require("express").Router();
const _ = require("lodash");

const { User } = require("../../models/user.js");
const { mongoose } = require("../../db/mongoose.js");
const { changeBalance, isEnoughBalance } = require("./usersFunctions.js");

const ethereumId = process.env.ETH || "5c27d33959afef244046c372";

router.get("/", (req, res) => {
  res.send("tez dziala");
});

router.get("/add", (req, res) => {
  User.find()
    .then(user => {
      res.send(user);
    })
    .catch(err => {
      res.send(err);
    });
});

router.post("/register", (req, res) => {
  const body = _.pick(req.body, ["email", "password"]);
  const user = new User(body);
  console.log(req.body);
  user
    .save()
    .then(() => {
      res.json({ message: "Dodano uzytkownika" });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Nie udalo sie dodac uzytkownika");
    });
});

router.post("/login", async (req, res) => {
  const body = _.pick(req.body, ["email", "password"]);
  try {
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    const result = {
      token: token,
      email: user.email
    };
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: err });
  }
});

router.patch("/addEthAddress", async (req, res) => {
  try {
    console.log(req.body.token);
    const name = req.body.name;
    const address = req.body.address;
    const user = await User.findByToken(req.body.token);
    if (!user) {
      throw new Error();
    }

    user.addresses.push({ name, address });
    await user.save();
    res.json({ message: "user.eth_address.success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "user.eth_address.fail" });
  }
});

router.post("/addBalance", async (req, res) => {
  try {
    const user = await User.findByToken(req.body.token);
    user.cryptocurrencies.push({
      cryptocurrency: req.body.cryptocurrency_id,
      balance: req.body.balance
    });
    await user.save();
    res.json("success");
  } catch (err) {
    res.json({ message: "fail", error: err });
  }
});

router.get("/getBalances", async (req, res) => {
  try {
    const user = await User.findByToken(req.body.token);
    if (!user) {
      throw new Error("user.not_found");
    }

    User.findOne({ _id: user._id })
      .populate("cryptocurrencies.cryptocurrency")
      .exec()
      .then(userTemp => {
        const result = [];
        userTemp.cryptocurrencies.forEach(cryptocurrency => {
          console.log(cryptocurrency.name);
          result.push({
            cryptocurrency_id: cryptocurrency.cryptocurrency._id,
            cryptocurrency_name: cryptocurrency.cryptocurrency.name,
            cryptocurrency_ticker: cryptocurrency.cryptocurrency.ticker,
            balance: cryptocurrency.balance
          });
        });
        res.json(result);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: "jakis blad" });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "unable to find user with provided token" });
  }
});

router.patch("/changeBalance", async (req, res) => {
  //onlyOne(boolean), cryptocurrencies [(objectId)], balances[number],
  const cryptocurrency_id = req.body.cryptocurrency_id;
  const value = req.body.value;
  try {
    const user = await User.findByToken(req.body.token);
    if (!user) {
      throw new Error("user.not_found");
    }

    if (isEnoughBalance(user, cryptocurrency_id, value)) {
      const result = await changeBalance(user, cryptocurrency_id, value);
      res.json({ message: result });
    } else {
      throw new Error("user.enough_balance.false");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
