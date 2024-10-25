//verify jwt
const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
  const { user_token } = req.cookies;
  if (!user_token) {
    return res.status(401).json({ message: "you are not logged in" });
  }
  jwt.verify(user_token, process.env.JWT_SECRET, (error, info) => {
    if (error) {
      return res.status(401).json({ message: "invalid token" });
    }
    req.user = info;
    next();
  });
};

module.exports = { verify };
