// routes/MessagesRoute.js
const express = require("express");
const router = express.Router();
const Message = require("../Model/UserModel");
const verifyToken = require("../middleware/authMiddleware");

// GET messages between two users (PROTECTED)
router.get("/:from/:to", verifyToken, async (req, res) => {
  const { from, to } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { from, to },
        { from: to, to: from }
      ]
    }).sort({ time: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;