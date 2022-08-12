const router = require("express").Router();
const StatusCodes = require("http-status-codes").StatusCodes;
const User = require("../model/User");

const verifyTokenMiddleware = require("../middleware/verify-token.middleware");

router.get("/:id", verifyTokenMiddleware, async (req, res) => {
  try {
    const user = await User.findById(String(req.params.id))?.select(
      "-password -__v"
    );
    if (user) {
      res.send(user);
    } else {
      res.status(StatusCodes.NOT_FOUND).send({ error: "User not found!" });
    }
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
  }
});

module.exports = router;
