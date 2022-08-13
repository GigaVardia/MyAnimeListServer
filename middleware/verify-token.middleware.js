const jwt = require("jsonwebtoken");
const StatusCodes = require("http-status-codes").StatusCodes;

module.exports = function verifyToken(req, res, next) {
  if (req.headers.authorization?.split(" ")[0] === "Bearer") {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const verify = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verify;
      next();
    } catch (err) {
      res.status(StatusCodes.UNAUTHORIZED).send({ error: "Invalid token" });
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).send({ error: "Access denied" });
  }
};
