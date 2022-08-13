const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const verifyTokenMiddleware = require("./middleware/verify-token.middleware");

const authRoute = require("./routes/auth");
const animeRoute = require("./routes/anime");
const userRoute = require("./routes/user");

require("dotenv").config();

const API_VERSION = process.env.API_VERSION;

// connect db
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }, () => {
  console.log("Db connected");
});

app.use(cors());
app.use(express.json());

app.use(`/api/${API_VERSION}/auth`, authRoute);
app.use(`/api/${API_VERSION}/anime`, verifyTokenMiddleware, animeRoute);
app.use(`/api/${API_VERSION}/users`, verifyTokenMiddleware, userRoute);

app.listen(3000, () => {
  console.log("Server running on port", 3000);
});
