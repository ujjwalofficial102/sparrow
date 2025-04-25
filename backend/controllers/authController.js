import User from "../models/user-model.js";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../utils/genToken.js";

export const signup = async (req, res) => {
  try {
    const { username, email, fullname, password } = req.body;

    if (!username || !email || !fullname || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists, please login",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      fullname,
      password: hashedPass,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        success: true,
        data: {
          _id: newUser._id,
          username: newUser.username,
          fullname: newUser.fullname,
          email: newUser.email,
          followers: newUser.followers,
          following: newUser.following,
          profileImg: newUser.profileImg,
          coverImg: newUser.coverImg,
        },
      });
    } else {
      res.status(400).json({
        success: true,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not found, please signup",
      });
    }

    const isPass = await bcrypt.compare(password, existingUser.password);
    if (!isPass) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    generateTokenAndSetCookie(existingUser._id, res);
    res.status(200).json({
      success: true,
      data: {
        _id: existingUser._id,
        username: existingUser.username,
        fullname: existingUser.fullname,
        email: existingUser.email,
        followers: existingUser.followers,
        following: existingUser.following,
        profileImg: existingUser.profileImg,
        coverImg: existingUser.coverImg,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
