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

// routes/messages.js
router.get("/all/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    // Get all messages where the user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);

  }
});


module.exports = router;
