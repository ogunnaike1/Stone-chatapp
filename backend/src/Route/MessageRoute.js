const express = require("express");
const router = express.Router();
const Message = require("../Model/MessageModel");
const verifyToken = require("../middleware/authMiddleware");

/* ================= ALL USER MESSAGES ================= */
router.get("/all/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SINGLE CONVERSATION ================= */
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


// Clear all messages between two users
router.delete("/clear/:userId/:otherUserId", verifyToken, async (req, res) => {
  const { userId, otherUserId } = req.params;

  try {
    await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    });

    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (err) {
    console.error("Clear chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
