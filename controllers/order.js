const orderModel = require("../models/order");
const cartModel = require("../models/cart");
const productModel = require("../models/product");

//create an order
//private user
const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { paymentDetails, shippingDetails } = req.body;
  try {
    //fetch user cart
    const cart = await cartModel
      .findOne({ userId })
      .populate({ path: "items.productId", select: "name brand price" });
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({
        message: "cart is empty, Please add products before creating an order",
      });
    }
    const order = new orderModel({
      userId,
      items: cart.items,
      paymentDetails,
      shippingDetails,
      totalAmount: cart.totalPrice,
    });
    const savedOrder = await order.save();
    //clear cart after making order
    await cartModel.findOneAndUpdate({ userId }, { items: [], totalPrice: 0 });
    //reduce quantity in stock
    res.status(201).json({
      message: "order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//get orders
//private user
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel
      .find({ userId })
      .populate({ path: "userId", select: "name email" })
      .populate({ path: "items.productId", select: "name brand price" });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
//get by id
//private admin
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    if (role !== "SuperAdmin" && role !== "Admin") {
      return res.status(403).json({ message: "you are not authorized" });
    }
    const order = await orderModel
      .findById(id)
      .populate({ path: "userId", select: "name email" })
      .populate({ path: "items.productId", select: "name brand price" });
    if (!order) {
      return res.status(404).json({ message: "order does not exist" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//get orders, by status
//private Admin
const getOrders = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "SuperAdmin" && role !== "Admin") {
      return res.status(403).json({ message: "you are not authorized" });
    }
    const orders = await orderModel
      .find()
      .populate({ path: "userId", select: "name email" })
      .populate({ path: "items.productId", select: "name brand price" });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//update order status
//private admin
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { role } = req.user;
    if (role !== "SuperAdmin" && role !== "Admin") {
      return res.status(403).json({ message: "you are not authorized" });
    }
    const order = await orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "order does not exist" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrderStatus,
};
