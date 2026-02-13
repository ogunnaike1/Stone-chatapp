const express = require("express")
const userRouter = express.Router()
const verifyToken = require("../middleware/authMiddleware")
const  ForgotPassword = require("../Controller/ForgotPasswordController")


const { SignUpUser, LoginUser, UploadProfilePic, getAllUsers, ResetPassword, searchUsers, addFriend , removeFriend, getMyFriends  } = require("../Controller/UserController")

userRouter.post("/signup", SignUpUser)
userRouter.post("/login", LoginUser)
userRouter.post("/upload-profile-pic", UploadProfilePic)
userRouter.get("/users", verifyToken, getAllUsers)
userRouter.post("/forgot-password", ForgotPassword);
userRouter.post("/reset-password/:token", ResetPassword);
userRouter.get("/friends/search",  verifyToken, searchUsers);
userRouter.get("/friends",  verifyToken, getMyFriends );
userRouter.post("/friends/add", verifyToken, addFriend);
userRouter.delete("/friends/remove/:friendId", verifyToken,  removeFriend);



module.exports = userRouter;