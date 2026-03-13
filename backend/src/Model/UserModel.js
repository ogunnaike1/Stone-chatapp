const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },

    profilePicture: String,
    socketId:       String,

    // ── Password reset (OTP-based) ──────────────────────────────────────────
    resetOTP:        String, // 4-digit code
    resetOTPExpires: Date,   // 10-minute expiry

    // ── Friends ─────────────────────────────────────────────────────────────
    friends: [
      { type: mongoose.Schema.Types.ObjectId, ref: "user_collection" },
    ],
    friendRequestsSent: [
      { type: mongoose.Schema.Types.ObjectId, ref: "user_collection" },
    ],
    friendRequestsReceived: [
      { type: mongoose.Schema.Types.ObjectId, ref: "user_collection" },
    ],
  },
  { timestamps: true }
);

const userModel = mongoose.model("user_collection", UserSchema);

module.exports = userModel;