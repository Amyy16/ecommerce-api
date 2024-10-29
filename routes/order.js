const express = require("express");
const routes = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/order");
const { verify } = require("../middlewares/verify");

routes.post("/orders", verify, createOrder);
routes.get("/orders", verify, getMyOrders);
routes.get("/admin/orders/:id", verify, getOrder);
routes.get("/admin/orders", verify, getOrders);
routes.put("/admin/orders/:id", verify, updateOrderStatus);

module.exports = routes;
