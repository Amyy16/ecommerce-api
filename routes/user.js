const express = require("express");
const routes = express.Router();
const {
  updateUserInfo,
  updatepwd,
  deleteUser,
  updateRole,
  getUser,
  getUsers,
} = require("../controllers/user");
const { verify } = require("../middlewares/verify");

routes.put("/update", verify, updateUserInfo);
routes.put("/change-password", verify, updatepwd);
routes.delete("/delete", verify, deleteUser);
routes.put("/change-role", verify, updateRole);
routes.get("/allUsers", verify, getUsers);
routes.get("/oneuser/:id", verify, getUser);

module.exports = routes;
