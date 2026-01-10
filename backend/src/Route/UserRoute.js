const express = require("express")
const userRouter = express.Router()

const { SignUpUser, LoginUser, UploadProfilePic} = require("../Controller/UserController")

userRouter.post("/signup", SignUpUser)
userRouter.post("/login", LoginUser)
userRouter.post("/upload-profile-pic", UploadProfilePic)


module.exports = userRouter;