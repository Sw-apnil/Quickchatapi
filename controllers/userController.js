//Signup a new user
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";




export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    // Check if user already exists
    if (!fullName || !email || !password) {
      return res.json({
        success: false,
        message: "Please fill all the fields",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);
    res.json({
      success: true,
      newUser,
      token,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
