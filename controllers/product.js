const productModel = require("../models/product");

//create new products
//private admin
const addProduct = async (req, res) => {
  try {
    const { creatorId, ...others } = req.body;
    const userId = req.user.id;
    const { role } = req.user;
    if (role !== "SuperAdmin" && role !== "Admin") {
      return res.status(403).json({ message: "you are not authorized" });
    }
    const newproduct = new productModel({ creatorId: userId, ...others });
    const savedProduct = await newproduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get products with query
//private users
//search by category, brand, price
const getProducts = async (req, res) => {
  try {
    const { category, brand, priceMin, priceMax } = req.query;
    //build query object
    let query = {};
    if (category) {
      query.category = category;
    }
    if (brand) {
      query.brand = brand;
    }
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) {
        query.price.$gte = priceMin; //greater than or equal to the priceMin
      }
      if (priceMax) {
        query.price.$lte = priceMax; //less than or equal to the priceMax
      }
    }
    //get products based on query
    const products = await productModel.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//update products
//private admin
const updateProduct = async (req, res) => {
  try {
    // const userId = req.user.id
    const { id } = req.params;
    const { role } = req.user;
    const { creatorId, ...others } = req.body;
    //get product
    const product = await productModel.findById(id);
    if (!product) {
      return res.json({ message: "product does not exist" });
    }
    //check if authorized
    if (role !== "SuperAdmin" && role !== "Admin") {
      return res.status(403).json({ message: "you are not authorized" });
    }
    //update product
    const updatedProduct = await productModel.findByIdAndUpdate(id, others, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "product updated successfully", updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete products
//private admin
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;
  //get product
  const product = await productModel.findById(id);
  if (!product) {
    return res.json({ message: "product does not exist" });
  }
  //check if authorized
  if (role !== "SuperAdmin" && role !== "Admin") {
    return res.status(403).json({ message: "you are not authorized" });
  }
  try {
    await productModel.findByIdAndDelete(id);
    res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" }, error.message);
  }
};

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
