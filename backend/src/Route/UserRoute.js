const express = require("express")
const userRouter = express.Router()

const { SignUpUser, LoginUser} = require("../Controller/UserController")

userRouter.post("/signup", SignUpUser)
userRouter.post("/login", LoginUser)

module.exports = userRouter;