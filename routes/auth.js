const express = require("express");
const routes = express.Router();
const {
  registerUser,
  loginUSer,
  oauthRegister,
  logoutUser,
} = require("../controllers/auth");
const { verify } = require("../middlewares/verify");

routes.post("/register", registerUser);
routes.post("/login", loginUSer);
routes.post("/oauth", oauthRegister);
routes.post("/logout", verify, logoutUser);

module.exports = routes;
