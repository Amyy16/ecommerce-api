const express = require("express");
const routes = express.Router();
const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");

const { verify } = require("../middlewares/verify");

routes.post("/admin/product", verify, addProduct);
routes.get("/products", verify, getProducts);
routes.put("/admin/product/:id", verify, updateProduct);
routes.delete("/admin/product/:id", verify, deleteProduct);

module.exports = routes;
