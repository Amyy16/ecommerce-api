const userModel = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//register a user
//POST @ route /user/register
//public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedpassword = bcrypt.hashSync(password, salt);
    const newUser = new userModel({
      name,
      email,
      password: hashedpassword,
    });
    await newUser.save();
    res.status(201).json({ message: "user creation successful" });
  } catch (error) {
    res.status(404).json(error.message);
  }
};

//login a user
//POST @ route /user/login
//public
const loginUSer = async (req, res) => {
  const { email, password } = req.body;
  try {
    //check if user exists
    const userInfo = await userModel.findOne({ email });
    if (!userInfo) {
      return res.status(404).json({ message: "user not found" });
    }
    //check if password matches
    const verify = bcrypt.compareSync(password, userInfo.password);
    if (!verify) {
      return res.status(404).json({ message: "invalid credentials" });
    }
    const aboutUser = { id: userInfo._id, role: userInfo.role };
    const token = jwt.sign(aboutUser, process.env.JWT_SECRET);
    res
      .cookie("user_token", token)
      .status(200)
      .json({ message: "user login successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//login/registering with oauth
//POST @/oauth
const oauthRegister = async (req, res) => {
  const { name, email, gender } = req.body;
  try {
    //check if account exist and it is credential account
    const findOne = await userModel.findOne({ email });
    if (findOne && findOne.credentialAccount) {
      return res.json({ message: "illegal parameters" });
    }
    //find account and login
    if (findOne) {
      const aboutUser = { id: findOne._id, role: findOne.role };
      const token = jwt.sign(aboutUser, process.env.JWT_SECRET);
      return res
        .cookie("user_token", token)
        .status(200)
        .json({ message: "login successful" });
    }
    //creating a new user and logging in
    const newUser = new userModel({
      name,
      email,
      gender,
      credentialAccount: false,
    });
    const savedUser = await newUser.save();
    const aboutUser = { id: savedUser.id, role: savedUser.role };
    const token = jwt.sign(aboutUser, process.env.JWT_SECRET);
    res
      .cookie("user_token", token)
      .status(200)
      .json({ message: "registration successful" });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//logout user and clear cookie
//POST @/logout
const logoutUser = async (req, res) => {
  try {
    res
      .clearCookie("user_token")
      .status(200)
      .json({ message: "user logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
};

module.exports = {
  registerUser,
  loginUSer,
  oauthRegister,
  logoutUser,
};
