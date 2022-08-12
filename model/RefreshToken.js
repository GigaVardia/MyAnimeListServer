const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
