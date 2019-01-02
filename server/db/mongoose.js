const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/cryptoExchange');

module.exports = {
  mongoose
}
