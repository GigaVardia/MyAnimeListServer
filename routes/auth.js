const router = require("express").Router();
const StatusCodes = require("http-status-codes").StatusCodes;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function generatePairOfTokens(userId) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    }
  );

  return { accessToken, refreshToken };
}

async function saveRefreshToken({ token, userId }) {
  const dbRefreshToken = new RefreshToken({
    token,
    userId,
  });

  await dbRefreshToken.save();
}

// models
const User = require("../model/User");
const RefreshToken = require("../model/RefreshToken");

const Joi = require("joi");

const registerValidationSchema = Joi.object({
  name: Joi.string().max(255).required(),
  password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  repeatPassword: Joi.ref("password"),
  email: Joi.string().max(255).required().email(),
});

const loginValidationSchema = Joi.object({
  email: Joi.string().max(255).required().email(),
  password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});

router.post("/register", async (req, res) => {
  const { error } = registerValidationSchema.validate(req.body);
  if (error) return res.status(StatusCodes.BAD_REQUEST).send({ error });

  const emailExists = await User.findOne({ email: req.body.email });

  if (emailExists)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: "User with this email already exists!" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    password: hashedPassword,
    email: req.body.email,
  });

  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidationSchema.validate(req.body);
  if (error) return res.status(StatusCodes.BAD_REQUEST).send({ error });

  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ error: "User with this email not exists" });

  const match = await bcrypt.compare(req.body.password, user.password);

  if (match) {
    const { accessToken, refreshToken } = generatePairOfTokens(user._id);

    await saveRefreshToken({ token: refreshToken, userId: user._id });

    return res.send({ accessToken, refreshToken });
  } else {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ error: "Email or password is not correct" });
  }
});

router.post("/refresh-token", async (req, res) => {
  const token = req.body.refreshToken;

  if (!token)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ error: "Refresh token is not valid" });

  try {
    const user = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
    const dbRefreshToken = await RefreshToken.findOneAndDelete({
      token,
    });

    if (!dbRefreshToken)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ error: "Refresh token is not valid" });

    const { accessToken, refreshToken } = generatePairOfTokens(user.userId);

    await saveRefreshToken({ token: refreshToken, userId: user.userId });

    return res.send({ accessToken, refreshToken });
  } catch (error) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid token",
        },
      ],
    });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.body.token;

  await RefreshToken.deleteOne({ token });

  res.sendStatus(204);
});

module.exports = router;
