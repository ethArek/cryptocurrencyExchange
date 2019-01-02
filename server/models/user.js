const mongoose = require("mongoose");
const validator = require("validator");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ObjectId = mongoose.Schema.Types.ObjectId;

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: [true, "it has to be a unique email"],
    minlength: 1,
    validate: {
      validator: value => {
        return validator.isEmail(value);
      },
      message: "{value} is not valid"
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  cryptocurrencies: [
    {
      cryptocurrency: {
        type: ObjectId,
        required: true,
        ref: "cryptocurrencies"
      },
      fullBalance: {
        type: Number,
        required: true
      },
      availableBalance: {
        type: Number,
        required: true
      }
    }
  ],
  addresses: [
    {
      name: {
        type: String,
        required: true
        /*unique: [true, "user.eth_address.name_exists"] unique nie dziala*/
      },
      address: {
        type: String,
        required: true
      }
    }
  ],
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

UserSchema.pre("save", function(next) {
  const user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

UserSchema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ["_id", "email"]);
};

UserSchema.statics.findByCredentials = async function(email, password) {
  const User = this;
  const user = await User.findOne({ email });
  if (!user) {
    return Promise.reject("user.not_found");
  }

  return new Promise(async (resolve, reject) => {
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      reject("user.invalid_password");
    } else {
      resolve(user);
    }
  });
};

UserSchema.methods.generateAuthToken = async function() {
  try {
    const user = this;
    const access = "auth";
    const token = jwt
      .sign({ _id: user._id.toHexString(), access }, "lellel")
      .toString();
    user.tokens.push({ access, token });
    console.log(access + " " + token);
    await user.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, "lellel");
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

const User = mongoose.model("User", UserSchema);

module.exports = { User };
