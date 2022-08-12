const router = require("express").Router();
const StatusCodes = require("http-status-codes").StatusCodes;
const Anime = require("../model/Anime");

const Joi = require("joi");
const verifyTokenMiddleware = require("../middleware/verify-token.middleware");

const schema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().max(1024),
  seasons: Joi.number().max(9999),
  episodes: Joi.number().max(9999),
});

router.post("/", verifyTokenMiddleware, async (req, res) => {
  const anime = new Anime({
    title: req.body.title,
    description: req.body.description || null,
    seasons: req.body.seasons || null,
    episodes: req.body.episodes || null,
    userId: req.user.userId,
  });

  try {
    await schema.validateAsync(req.body);
    const savedAnime = await anime.save();
    res.send(savedAnime);
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send(err.message);
  }
});

router.get("/", verifyTokenMiddleware, async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 25;

  const data = await Anime.paginate(
    { userId: req.user.userId },
    { page, limit }
  );

  res.send(data);
});

module.exports = router;
