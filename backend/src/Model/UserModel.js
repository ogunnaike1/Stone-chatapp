
const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }

},  { timestamps: true }) ;

const userModel = mongoose.model("user_collection", UserSchema)

module.exports = userModel