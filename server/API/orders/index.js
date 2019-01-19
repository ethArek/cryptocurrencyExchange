const router = require("express").Router();
const _ = require("lodash");

const { User } = require("../../models/user.js");
const { Order } = require("../../models/orders.js");
const {
  changeAvailableBalance,
  changeFullBalance,
  isEnoughBalance
} = require("../users/usersFunctions.js");
const { getRemainingAmount } = require("./ordersFunctions.js");

router.post("/placeOrder", async (req, res) => {
  const body = _.pick(req.body, [
    "cryptocurrency_id",
    "amount",
    "price",
    "isBuyOrder",
    "token"
  ]);

  try {
    const user = await User.findByToken(body.token);
    if (!user) {
      throw new Error("user.not_found");
    }
    let orderValue;
    if (isBuyOrder) {
      orderValue = price * amount;
    } else {
      orderValue = amount;
    }
    if (isEnoughBalance(user, body.cryptocurrency_id, orderValue)) {
      const order = new Order(body);
      await order.save();
      orderValue *= -1;
      await changeAvailableBalance(user, body.cryptocurrency_id, orderValue);
      res.json("order.place.success");
    } else {
      throw new Error("order.crypto.not_enough");
    }
  } catch (err) {
    res.json({ error: err });
  }
});

router.post("/takeOrder", async (req, res) => {
  const body = _.pick(req.body, ["order_id", "token", "amount"]);

  try {
    const order = Order.findById(body.order_id);
    const taker = User.findByToken(body.token);
    const maker = User.findById(order.user_id);

    let remainingAmount = await getRemainingAmount(body.order_id);
    const valueTaker = req.body.amount * order.price * -1;
    const hasTakerEnoughBalance = await isEnoughBalance(
      taker,
      process.env.ETHEREUM_ID,
      valueTaker
    );

    if (remaingAmount >= req.body.amount) {
      if (hasTakerEnoughBalance) {
        order.closed.push({
          amount: req.body.amount
        });
        await changeFullBalance(taker, process.env.ETHEREUM_ID, valueTaker);
        await changeAvailableBalance(
          taker,
          process.env.ETHEREUM_ID,
          valueTaker
        );

        await changeFullBalance(
          taker,
          order.cryptocurrency_id,
          body.amount * -1
        );
        await changeAvailableBalance(
          taker,
          order.cryptocurrency_id,
          body.amount * -1
        );

        await changeFullBalance(
          maker,
          process.env.Ethereum_ID,
          valueTaker * -1
        );
        await changeAvailableBalance(
          maker,
          process.env.Ethereum_ID,
          valueTaker * -1
        );

        await changeFullBalance(maker, order.cryptocurrency_id, amount * -1);
        await changeAvailableBalance(
          maker,
          order.cryptocurrency_id,
          amount * -1
        );

        if (remainingAmount - amount === 0) {
          order.isCompleted = true;
        }

        await order.save();
        await taker.save();
        await make.save();

        res.json({ message: "transaction.success" });
      }
    } else {
      throw new Error("transaction.not_enough");
    }
  } catch (err) {
    res.status(500).json({ error: "transaction.fail" });
  }
});

router.get("/getOrders", async (req, res) => {
  try {
    const buyOrders = await Order.find({ isBuyOrder: true });
    const sellOrders = await Order.find({ isBuyOrder: false });

    const result = {
      buyOrders,
      sellOrders
    };

    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});
