const express = require("express");
const router = express.Router();
const Message = require("../Model/MessageModel");
const verifyToken = require("../middleware/authMiddleware");

router.get("/:userId/:otherUserId", verifyToken, async (req, res) => {
  const { userId, otherUserId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
