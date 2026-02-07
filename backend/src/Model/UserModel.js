
const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: String,
    socketId: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

},  { timestamps: true }) ;

const userModel = mongoose.model("user_collection", UserSchema)

module.exports = userModel