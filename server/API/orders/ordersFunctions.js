const _ = require("lodash");

const { Order } = require("../../models/orders.js");

const getRemainingAmount = async order_id => {
  try {
    const order = Order.findById(order_id);
    const initialAmount = order.value;
    let closedAmount = 0;
    if (order.closed) {
      order.closed.forEach(close => {
        closedAmount += close.value;
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
