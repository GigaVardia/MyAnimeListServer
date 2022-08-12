const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      max: 255,
    },
    email: {
      type: String,
      required: true,
      min: 3,
      max: 255,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
