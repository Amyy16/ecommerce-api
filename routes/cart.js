const express = require("express");
const routes = express.Router();
const {
  addToCart,
  viewCart,
  removeProduct,
  decreaseQuantity,
  clearCart,
} = require("../controllers/cart");

const { verify } = require("../middlewares/verify");

routes.post("/cart", verify, addToCart);
routes.get("/cart", verify, viewCart);
routes.delete("/cart/removeProduct", verify, removeProduct);
routes.post("/cart/decreaseQuantity", verify, decreaseQuantity);
routes.delete("/clearCart", verify, clearCart);

module.exports = routes;
