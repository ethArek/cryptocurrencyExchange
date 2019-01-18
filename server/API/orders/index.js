const router = require("express").Router();
const _ = require("lodash");

const { User } = require("../../models/user.js");
const { Order } = require("../../models/orders.js");
const { changeAvailableBalance } = require("../users/usersFunctions.js");

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
  const body = _.pick(req.body, ["order_id", "token"]);

  const order = Order.findById(body.order_id);
  const taker = User.findByToken(body.token);
  const maker = User.findById(order.user_id);
});
