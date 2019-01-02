const _ = require("lodash");

const { User } = require("../../models/user.js");
const { mongoose } = require("../../db/mongoose.js");

//value = Number
const changeBalance = async (user, cryptocurrency_id, value) => {
  try {
    let flag = false;
    for (let cryptocurrency of user.cryptocurrencies) {
      if (cryptocurrency.cryptocurrency == cryptocurrency_id) {
        cryptocurrency.balance += value;
        flag = true;
        break;
      }
    }
    console.log(`flag: ${flag}`);
    if (!flag) {
      user.cryptocurrencies.push({
        cryptocurrency: cryptocurrency_id,
        balance: value
      });
    }
    await user.save();
    return "user.balance_change.success";
  } catch (err) {
    console.log(err);
    return "user.balance_change.fail";
  }
};

const isEnoughBalance = (user, cryptocurrency_id, value) => {
  if (value > 0) {
    console.log("what");
    return true;
  }

  for (let cryptocurrency of user.cryptocurrencies) {
    if (cryptocurrency.cryptocurrency == cryptocurrency_id) {
      if (cryptocurrency.balance + value > 0) {
        return true;
      } else {
        return false;
      }
    }
  }
};

module.exports = {
  changeBalance,
  isEnoughBalance
};
