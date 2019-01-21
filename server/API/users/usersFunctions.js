const _ = require("lodash");

const { User } = require("../../models/user.js");
const { mongoose } = require("../../db/mongoose.js");

//value = Number
const changeBalance = async (user, cryptocurrency_id, value) => {
  try {
    let flag = false;
    for (let cryptocurrency of user.cryptocurrencies) {
      if (cryptocurrency.cryptocurrency == cryptocurrency_id) {
        cryptocurrency.fullBalance += value;
        cryptocurrency.availableBalance += value;
        flag = true;
        break;
      }
    }
    console.log(`flag: ${flag}`);
    if (!flag) {
      user.cryptocurrencies.push({
        cryptocurrency: cryptocurrency_id,
        fullBalance: value,
        availableBalance: value
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
  console.log("VALUE: " + value);
  if (value > 0) {
    return true;
  }

  for (let cryptocurrency of user.cryptocurrencies) {
    if (cryptocurrency.cryptocurrency == cryptocurrency_id) {
      if (cryptocurrency.availableBalance + value > 0) {
        return true;
      } else {
        return false;
      }
    }
  }
};

const changeAvailableBalance = async (user, cryptocurrency_id, value) => {
  try {
    for (let cryptocurrency of user.cryptocurrencies) {
      if (cryptocurrency.cryptocurrency == cryptocurrency_id.toString()) {
        cryptocurrency.availableBalance += value;
      }
    }

    return user;
    return "user.avilable_balance_change.success";
  } catch (err) {
    console.log(err);
    return "user.available_balance_change.fail";
  }
};

const changeFullBalance = async (user, cryptocurrency_id, value) => {
  //console.log(cryptocurrency_id + "            " + "gdsadgasdgasdgasdgadsga");
  try {
    for (let cryptocurrency of user.cryptocurrencies) {
      if (cryptocurrency.cryptocurrency == cryptocurrency_id.toString()) {
        cryptocurrency.fullBalance += value;
      }
    }

    return user;
  } catch (err) {
    console.log(err);
    return "user.available_balance_change.fail";
  }
};

module.exports = {
  changeAvailableBalance,
  changeFullBalance,
  isEnoughBalance
};
