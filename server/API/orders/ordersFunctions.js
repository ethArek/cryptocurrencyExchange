const _ = require("lodash");

const { Order } = require("../../models/orders.js");

const getRemainingAmount = order => {
  try {
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
