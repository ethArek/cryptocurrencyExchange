const _ = require("lodash");

const { Order } = require("../../models/orders.js");

const getRemainingAmount = async order_id => {
  try {
    const order = await Order.findById(order_id);
    const initialAmount = order.amount;
    let closedAmount = 0;
    if (order.closed) {
      order.closed.forEach(close => {
        closedAmount += close.amount;
      });
    }

    return initialAmount - closedAmount;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getRemainingAmount
};
