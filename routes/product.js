const express = require("express");
const routes = express.Router();
const {
  addProduct,
  getProducts,
  products,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");

const { verify } = require("../middlewares/verify");

routes.post("/addproduct", verify, addProduct);
routes.get("/allproducts", getProducts);
routes.get("/products", verify, products);
routes.put("/product/:id", verify, updateProduct);
routes.delete("/product/:id", verify, deleteProduct);

module.exports = routes;
