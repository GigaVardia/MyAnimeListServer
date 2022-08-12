const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const animeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      max: 255,
    },
    userId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      max: 255,
    },
    seasons: {
      type: String,
      max: 255,
    },
    episodes: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

animeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Anime", animeSchema);
