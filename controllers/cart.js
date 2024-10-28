const cartModel = require("../models/cart");
const productModel = require("../models/product");

//add to cart
//private user
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    //check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }
    //check if requested quantity is in stock
    if (product.instock < quantity) {
      return res
        .status(400)
        .json({ message: ` ${product.instock} units available in stock` });
    }
    //find user cart if it doesn't exist create one
    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      cart = new cartModel({ userId, items: [] });
    }
    //check if product is already in the cart
    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex > -1) {
      //update quantity and price if the product exists in cart
      const newQuantity = cart.items[productIndex].quantity + quantity;
      //check if new quantity exceeds products available in stocks
      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: `cannot add ${newQuantity} units to cart. ${product.stock} units available in stock`,
        });
      }
      cart.items[productIndex].quantity = newQuantity;
      cart.items[productIndex].price =
        cart.items[productIndex].quantity * product.price;
    } else {
      cart.items.push({
        productId: productId,
        quantity,
        price: quantity * product.price,
      });
    }
    //update the cart total price
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price, 0);
    const savedCart = await cart.save();
    res.status(201).json({ message: "product added successfully", savedCart });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
//view cart
//private user
const viewCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartModel
      .findOne({ userId })
      .populate({ path: "items.productId", select: "name price brand" });
    if (!cart) {
      return res.status(404).json({ message: "cart is not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
//edit cart (remove a product from cart)
//private user
const removeProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "cart is not found" });
    }
    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex === -1) {
      return res.status(404).json({ message: "product is not in cart" });
    }
    cart.items.splice(productIndex, 1);
    //recalculate total price
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price, 0);
    await cart.save();
    res.status(200).json({ message: "product removed", cart });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//decrease product quantity in cart by 1
//private user
const decreaseQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    //find user cart
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "cart not found" });
    }
    //check if the product is in the cart
    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex === -1) {
      return res.status(404).json({ message: "product not found in cart" });
    }
    //decrase quantity by one
    cart.items[productIndex].quantity -= 1;
    //update price based on quantity
    const product = await productModel.findById(productId);
    cart.items[productIndex].price =
      cart.items[productIndex].quantity * product.price;
    //remove product if quantity goes to zero or below
    if (cart.items[productIndex].quantity <= 0) {
      cart.items.splice(productIndex, 1);
    }
    //recalculate total price
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price, 0);
    await cart.save();
    res.status(200).json({ message: "quantity decreased by one", cart });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//clear cart
//private user
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "cart not found" });
    }
    //clear cart
    (cart.items = []), (cart.totalPrice = 0.0);
    await cart.save();
    res.status(200).json({ message: "cart cleared successfully", cart });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = {
  addToCart,
  viewCart,
  removeProduct,
  decreaseQuantity,
  clearCart,
};
