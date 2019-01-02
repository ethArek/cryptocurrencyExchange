const router = require("express").Router();
const _ = require("lodash");

const { User } = require("../../models/user.js");
const { mongoose } = require("../../db/mongoose.js");
const { changeBalance, isEnoughBalance } = require("./usersFunctions.js");

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

  user
    .save()
    .then(() => {
      res.send("Dodano uzytkownika");
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
    res.header("x-auth", token).json(user);
  } catch (err) {
    res.status(401).json({ error: err });
  }
});

router.patch("/addEthAddress", async (req, res) => {
  try {
    console.log(req.headers["x-auth"]);
    const name = req.body.name;
    const address = req.body.address;
    const user = await User.findByToken(req.headers["x-auth"]);
    if (!user) {
      console.log("what");
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
    const user = await User.findByToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzI3YzU3ZmQ5Y2M4NzI2MGNjYTc1MzYiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQ2MTEwMzQ0fQ.f0351QVWEseI251XMhptigy50f3Y7XlT9BDw0GQ1OCg"
    );
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
    const user = await User.findByToken(req.headers["x-auth"]);
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
  const cryptocurrency_id = "5c27d33959afef244046c372";
  const value = -120;
  try {
    const user = await User.findByToken(req.headers["x-auth"]);
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
