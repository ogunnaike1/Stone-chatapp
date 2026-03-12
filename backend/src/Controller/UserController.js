const mongoose = require("mongoose");
const userModel = require("../Model/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../Utils/Cloudinary");
const { isPasswordValid, getPasswordErrors } = require("../utils/passwordValidator");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/* ─────────────────────────────────────────────
   SIGN UP
───────────────────────────────────────────── */
const SignUpUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required", status: false });
    }

    // ── Password validation ──
    if (!isPasswordValid(password)) {
      const errors = getPasswordErrors(password);
      return res.status(400).json({
        message: "Password does not meet requirements",
        status: false,
        passwordErrors: errors.map((e) => e.label),
      });
    }

    const hashedpassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({ username, email, password: hashedpassword });

    if (newUser) {
      return res.status(201).json({
        message: "User created successfully",
        status: true,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    }
  } catch (error) {
    // MongoDB duplicate key (unique index violation)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]; // "username" or "email"
      const messages = {
        username: "That username is already taken. Please choose a different one.",
        email: "An account with that email already exists. Try logging in instead.",
      };
      return res.status(409).json({
        message: messages[field] || "Duplicate field value.",
        field,
        status: false,
      });
    }

    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error", status: false });
  }
};

/* ─────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────── */
const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required", status: false });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist", status: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password", status: false });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      token,
      message: "Login successful",
      status: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", status: false });
  }
};

/* ─────────────────────────────────────────────
   UPLOAD PROFILE PICTURE
───────────────────────────────────────────── */
const UploadProfilePic = async (req, res) => {
  try {
    const { userId, image } = req.body;

    if (!userId || !image) {
      return res.status(400).json({ message: "userId and image are required", status: false });
    }

    const profileImage = await cloudinary.uploader.upload(image, { folder: "profile_pictures" });

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { profilePicture: profileImage.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    return res.status(200).json({
      message: "Profile picture updated successfully",
      status: true,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    console.error("UploadProfilePic error:", error);
    return res.status(500).json({ message: "Server error", status: false });
  }
};

/* ─────────────────────────────────────────────
   RESET PASSWORD
───────────────────────────────────────────── */
const ResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required", status: false });
    }

    // ── Password validation ──
    if (!isPasswordValid(password)) {
      const errors = getPasswordErrors(password);
      return res.status(400).json({
        message: "Password does not meet requirements",
        status: false,
        passwordErrors: errors.map((e) => e.label),
      });
    }

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token", status: false });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful", status: true });
  } catch (error) {
    console.error("ResetPassword error:", error);
    res.status(500).json({ message: "Server error", status: false });
  }
};

/* ─────────────────────────────────────────────
   USER QUERIES
───────────────────────────────────────────── */
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find(
      { _id: { $ne: req.user.id } },
      "username email profilePicture socketId"
    );
    res.status(200).json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyFriends = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).populate("friends", "username profilePicture");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.friends);
  } catch (err) {
    console.error("getMyFriends error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    if (!query || !query.trim()) return res.status(200).json([]);

    const me = await userModel.findById(userId);
    const friends = me.friends || [];
    const sent = me.friendRequestsSent || [];

    const users = await userModel
      .find({
        _id: { $ne: userId, $nin: [...friends, ...sent] },
        username: { $regex: query, $options: "i" },
      })
      .select("username profilePicture");

    res.status(200).json(users);
  } catch (err) {
    console.error("Search users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const addFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;

    if (!friendId) return res.status(400).json({ message: "friendId required" });
    if (userId === friendId) return res.status(400).json({ message: "You cannot add yourself" });

    const user = await userModel.findById(userId);
    const friend = await userModel.findById(friendId);

    if (!friend) return res.status(404).json({ message: "User not found" });
    if (user.friends.includes(friendId)) return res.status(400).json({ message: "Already friends" });

    user.friends.push(friendId);
    friend.friends.push(userId);
    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend added", friendId });
  } catch (err) {
    console.error("Add friend error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const user = await userModel.findById(userId);
    const friend = await userModel.findById(friendId);

    if (!friend) return res.status(404).json({ message: "User not found" });

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed", friendId });
  } catch (err) {
    console.error("Remove friend error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  SignUpUser,
  LoginUser,
  UploadProfilePic,
  getAllUsers,
  ResetPassword,
  searchUsers,
  addFriend,
  removeFriend,
  getMyFriends,
};