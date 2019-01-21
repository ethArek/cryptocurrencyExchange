const router = require("express").Router();
const _ = require("lodash");

const { User } = require("../../models/user.js");
const { Order } = require("../../models/orders.js");
const { CryptoCurrency } = require("../../models/cryptocurrency.js");
const { Transaction } = require("../../models/transactions.js");

const {
  changeAvailableBalance,
  changeFullBalance,
  isEnoughBalance
} = require("../users/usersFunctions.js");
const { getRemainingAmount } = require("./ordersFunctions.js");

router.post("/getOrders", async (req, res) => {
  try {
    const buyOrders = await Order.find({
      isBuyOrder: true,
      cryptocurrency_id: req.body.cryptocurrency_id
    });
    const sellOrders = await Order.find({
      isBuyOrder: false,
      cryptocurrency_id: req.body.cryptocurrency_id
    });

    for (const buyOrder of buyOrders) {
      buyOrder.amount = getRemainingAmount(buyOrder);
    }

    for (const sellOrder of sellOrders) {
      sellOrder.amount = getRemainingAmount(sellOrder);
    }

    const result = {
      buyOrders,
      sellOrders
    };
    res.json(result);
  } catch (err) {
    console.log("error" + err);
    res.status(500).json({ error: err });
  }
});

router.get("/:ticker", async (req, res) => {
  console.log(req.params.ticker);
  try {
    const cryptocurrency = await CryptoCurrency.findOne({
      ticker: req.params.ticker
    });
    console.log(cryptocurrency);
    res.json(cryptocurrency);
  } catch (err) {
    console.log(err);
    res.status(422).json({ message: "cryptocurrency.not_found" });
  }
});

router.post("/placeOrder", async (req, res) => {
  const body = _.pick(req.body, [
    "cryptocurrency_id",
    "amount",
    "price",
    "isBuyOrder",
    "token"
  ]);
  console.log(req.body);
  try {
    const user = await User.findByToken(body.token);
    if (!user) {
      throw new Error("user.not_found");
    }
    let orderValue, tempCryptocurrency;
    if (body.isBuyOrder) {
      tempCryptocurrency = body.cryptocurrency_id;
      body.cryptocurrency_id = process.env.ETHEREUM_ID;
      orderValue = body.price * body.amount;
    } else {
      orderValue = body.amount;
      tempCryptocurrency = body.cryptocurrency_id;
    }
    console.log(orderValue);

    if (isEnoughBalance(user, body.cryptocurrency_id, orderValue * -1)) {
      console.log("tutaj jestem");
      const orderBody = {
        cryptocurrency_id: tempCryptocurrency,
        user_id: user._id,
        isBuyOrder: body.isBuyOrder,
        amount: body.amount,
        price: body.price,
        openedAt: new Date()
      };
      const order = new Order(orderBody);
      await order.save();
      orderValue *= -1;
      await changeAvailableBalance(user, body.cryptocurrency_id, orderValue);

      const result = {
        user_id: user._id,
        _id: order._id,
        message: "order.place.success"
      };
      res.json(result);
    } else {
      throw new Error("order.crypto.not_enough");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/takeOrder", async (req, res) => {
  const body = _.pick(req.body, ["order_id", "token", "amount"]);

  try {
    const order = await Order.findById(body.order_id);
    let maker, taker;

    if (order.isBuyOrder) {
      taker = await User.findByToken(body.token);
      maker = await User.findById(order.user_id);
    } else {
      maker = await User.findByToken(body.token);
      taker = await User.findById(order.user_id);
    }

    console.log(body.token);

    let remainingAmount = getRemainingAmount(order);
    const valueTaker = req.body.amount * order.price * -1;
    const hasTakerEnoughBalance = await isEnoughBalance(
      taker,
      process.env.ETHEREUM_ID,
      valueTaker
    );
    if (remainingAmount >= req.body.amount) {
      if (hasTakerEnoughBalance) {
        order.closed.push({
          amount: req.body.amount,
          date: new Date()
        });
        console.log(order.cryptocurrency_id);
        taker = await changeFullBalance(
          taker,
          process.env.ETHEREUM_ID,
          valueTaker * -1
        );
        taker = await changeAvailableBalance(
          taker,
          process.env.ETHEREUM_ID,
          valueTaker * -1
        );

        taker = await changeFullBalance(
          taker,
          order.cryptocurrency_id,
          body.amount * -1
        );
        taker = await changeAvailableBalance(
          taker,
          order.cryptocurrency_id,
          body.amount * -1
        );

        make = await changeFullBalance(
          maker,
          process.env.Ethereum_ID,
          valueTaker
        );
        maker = await changeAvailableBalance(
          maker,
          process.env.Ethereum_ID,
          valueTaker
        );

        maker = await changeFullBalance(
          maker,
          order.cryptocurrency_id,
          body.amount
        );
        maker = await changeAvailableBalance(
          maker,
          order.cryptocurrency_id,
          body.amount
        );

        if (remainingAmount - body.amount === 0) {
          order.isCompleted = true;
        }

        const transactionBody = {
          cryptocurrency_id: order.cryptocurrency_id,
          price: order.price,
          date: new Date()
        };

        const transaction = new Transaction(transactionBody);
        const cryptocurrency = await CryptoCurrency.findOne({
          _id: order.cryptocurrency_id
        });

        cryptocurrency.lastPrice = order.price;
        await cryptocurrency.save();

        await order.save();
        await taker.save();
        await maker.save();
        await transaction.save();

        res.json({ message: "transaction.success" });
      }
    } else {
      throw new Error("transaction.not_enough");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "transaction.fail" });
  }
});

module.exports = router;
