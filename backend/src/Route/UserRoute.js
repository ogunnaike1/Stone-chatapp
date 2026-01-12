const express = require("express")
const userRouter = express.Router()
const verifyToken = require("../middleware/authMiddleware")

const { SignUpUser, LoginUser, UploadProfilePic, getAllUsers} = require("../Controller/UserController")

userRouter.post("/signup", SignUpUser)
userRouter.post("/login", LoginUser)
userRouter.post("/upload-profile-pic", UploadProfilePic)
userRouter.get("/users", verifyToken, getAllUsers)


module.exports = userRouter;