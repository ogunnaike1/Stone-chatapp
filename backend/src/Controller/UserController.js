
const mongoose = require("mongoose")
const userModel = require("../Model/UserModel")
const bcrypt = require ("bcrypt")
const jwt = require("jsonwebtoken");
const cloudinary = require("../Utils/Cloudinary")




const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const SignUpUser = async(req,res) =>{
    
    try {
        const {username, email, password} = req.body
        if(!username || !email || !password){
            return res.status(400).json({ message: "All fields are required", status: false });
        }

        const hashedpassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({
            username, 
            email, 
            password:hashedpassword

        })

        if (newUser){
           return res.status(201).json({
            message:'user created succesfully',
            status:true,
            user:{
                id:newUser._id,
                username: newUser.username,
                email: newUser.email,
            }
           })
        }
        
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Server error", status: false });
        
    }

}

const LoginUser = async(req,res)=>{

    try {
        const {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({ message: "All fields are required", status: false });
        }
        const user = await userModel.findOne({email});

        if(!user){
            return res.status(400).json({ message: "user does not exist", status: false });
        }
        const isMatch = await  bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(400).json({ message: "invalid password", status: false });

        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        )


        return res.status(201).json({ token, message: "Login successful", status: true,  user : {id: user._id, username:user.username, email:user.email } });
        
    } catch (error) {
        console.error("login error:", error);
        return res.status(500).json({ message: "Server error", status: false });
    }

}

const UploadProfilePic = async(req, res)=>{

    try {
        const { userId, image } = req.body; 

        if (!userId || !image) {
            return res.status(400).json({ message: "userId and image are required", status: false });
          }

          const profileImage = await cloudinary.uploader.upload(image, {
            folder: "profile_pictures",
          });

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
}

const ResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required", status: false });
    }

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
        status: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
      status: true,
    });

  } catch (error) {
    console.error("ResetPassword error:", error);
    res.status(500).json({ message: "Server error", status: false });
  }
};



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
      const user = await userModel
        .findById(req.user.id)
        .populate("friends", "username profilePicture");
  
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
  
      if (!query || !query.trim()) {
        return res.status(200).json([]);
      }
  
      const me = await userModel.findById(userId);
  
      const friends = me.friends || [];
      const sent = me.friendRequestsSent || [];
  
      const users = await userModel.find({
        _id: {
          $ne: userId,
          $nin: [...friends, ...sent],
        },
        username: { $regex: query, $options: "i" },
      }).select("username profilePicture");
  
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
  
      if (!friendId) {
        return res.status(400).json({ message: "friendId required" });
      }
  
      if (userId === friendId) {
        return res.status(400).json({ message: "You cannot add yourself" });
      }
  
      const user = await userModel.findById(userId);
      const friend = await userModel.findById(friendId);
  
      if (!friend) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (user.friends.includes(friendId)) {
        return res.status(400).json({ message: "Already friends" });
      }
  
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
  
      if (!friend) {
        return res.status(404).json({ message: "User not found" });
      }
  
      user.friends = user.friends.filter(
        (id) => id.toString() !== friendId
      );
      friend.friends = friend.friends.filter(
        (id) => id.toString() !== userId
      );
  
      await user.save();
      await friend.save();
  
      res.status(200).json({ message: "Friend removed", friendId });
    } catch (err) {
      console.error("Remove friend error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  


module.exports = { SignUpUser, LoginUser, UploadProfilePic, getAllUsers, ResetPassword, searchUsers,  addFriend , removeFriend, getMyFriends };