const express = require("express")
const userRouter = express.Router()
const verifyToken = require("../middleware/authMiddleware")
const  ForgotPassword = require("../Controller/ForgotPasswordController")
const sendFriendRequest = require("../Controller/SendFriendRequestController")
const getSentFriendRequests = require("../Controller/GetSentFriendsRquestController")
const acceptFriendRequest = require("../Controller/AcceptFriendRequestController")
const rejectFriendRequest = require("../Controller/RejectFriendController")
const cancelFriendRequest = require("../Controller/CancelFriendRequestController");
const getIncomingFriendRequests = require("../Controller/GetIncomingFriendRequestsController");



const { SignUpUser, LoginUser, UploadProfilePic, getAllUsers, ResetPassword, searchUsers, addFriend , removeFriend, getMyFriends  } = require("../Controller/UserController")

userRouter.post("/signup", SignUpUser)
userRouter.post("/login", LoginUser)
userRouter.post("/upload-profile-pic", UploadProfilePic)
userRouter.get("/users", verifyToken, getAllUsers)
userRouter.post("/forgot-password", ForgotPassword);
userRouter.post("/reset-password/:token", ResetPassword);
userRouter.get("/friends/search",  verifyToken, searchUsers);
userRouter.get("/friends",  verifyToken, getMyFriends);
userRouter.post("/friends/add", verifyToken, addFriend);
userRouter.delete("/friends/remove/:friendId", verifyToken, removeFriend);

userRouter.get("/friends/requests/sent", verifyToken, getSentFriendRequests);

userRouter.post("/friends/request", verifyToken, sendFriendRequest);

userRouter.post("/friends/accept", verifyToken, acceptFriendRequest);

userRouter.post("/friends/reject", verifyToken, rejectFriendRequest);
userRouter.post("/friends/request/cancel", verifyToken, cancelFriendRequest);
userRouter.get("/friends/requests/incoming", verifyToken, getIncomingFriendRequests);



module.exports = userRouter;