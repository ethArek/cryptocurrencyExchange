const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const path = require("path");

const { mongoose } = require("./db/mongoose.js");
const app = express();
const { User } = require("./models/user.js");

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use("/API", require("./API"));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("hello mate");
});
