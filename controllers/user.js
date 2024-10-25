const userModel = require("../models/user");
const bcrypt = require("bcryptjs");

//update profile
//private user
const updateUserInfo = async (req, res) => {
  const { password, role, ...others } = req.body;
  const { id } = req.user;
  try {
    const updated = await userModel
      .findByIdAndUpdate(id, others, {
        new: true,
      })
      .select("-password");
    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
}; //pwd shows here hide it

//update password
//private user
const updatepwd = async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  const { id } = req.user;
  try {
    //get user
    const getuser = await userModel.findById(id);
    //verify oldpassword
    const verify = bcrypt.compareSync(oldpassword, getuser.password);
    if (!verify) {
      return res.status(404).json({ message: "incorrect password" });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedpassword = bcrypt.hashSync(newpassword, salt);
    await userModel.findByIdAndUpdate(
      id,
      { password: hashedpassword },
      { new: true }
    );
    res.status(201).json({ message: "password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete user - user delete his/her own acount
//private user
const deleteUser = async (req, res) => {
  const { id } = req.user;
  try {
    await userModel.findOneAndDelete(id);
    res
      .clearCookie("user_token")
      .status(200)
      .json({ message: "user deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
};

//change role
//private admin route
const updateRole = async (req, res) => {
  const { id } = req.body;
  const { role } = req.user;
  if (role !== "SuperAdmin" && role !== "Admin") {
    return res.status(403).json({ message: "you are not authorized" });
  }
  try {
    await userModel.findByIdAndUpdate(id, { role: "Admin" }, { new: true });
    res.status(201).json({ message: "User is now an admin" });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
};

//get all users
//private admin route
const getUsers = async (req, res) => {
  const { role } = req.user;
  if (role !== "SuperAdmin" && role !== "Admin") {
    return res.status(403).json({ message: "you are not authorized" });
  }
  try {
    const allUsers = await userModel.find().select("-password");
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
}; //remeber to come back and populate other info and removing pwd

//get single user
//private admin route
const getUser = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;
  if (role !== "SuperAdmin" && role !== "Admin") {
    return res.status(403).json({ message: "you are not authorized" });
  }
  try {
    const user = await userModel.findById(id).select("-password"); //populate user data
    if (!user) {
      return res.status(404).json({ message: "user does not exist" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//update profilepic
//
module.exports = {
  updateUserInfo,
  updatepwd,
  deleteUser,
  updateRole,
  getUser,
  getUsers,
};
