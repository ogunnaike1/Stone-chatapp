const { Server } = require("socket.io");
const User = require("../Model/UserModel");
const Message = require("../Model/MessageModel");

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    // REGISTER USER
    socket.on("register_user", async (userId) => {
      if (!userId) return;
      await User.findByIdAndUpdate(userId, { socketId: socket.id });
      console.log("✅ User registered:", userId);
    });

    // SEND MESSAGE
    socket.on("send_message", async ({ senderId, receiverId, text, messageId }) => {
      if (!senderId || !receiverId || !text || !messageId) return;

      // Save in DB
      const message = await Message.create({ senderId, receiverId, text });

      const payload = {
        from: senderId,
        to: receiverId,
        text,
        messageId, // unique ID for frontend
        createdAt: message.createdAt,
      };

      // Emit only to receiver
      const receiver = await User.findById(receiverId);
      if (receiver?.socketId) {
        io.to(receiver.socketId).emit("receive_message", payload);
      }
    });

    socket.on("disconnect", async () => {
      await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
      console.log("🔴 Disconnected:", socket.id);
    });
  });
};
