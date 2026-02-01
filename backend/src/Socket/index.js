const { Server } = require("socket.io");
const User = require("../Model/UserModel");
const Message = require("../Model/MessageModel");

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    // ---------------- REGISTER USER ----------------
    // user sends: { userId, avatar }
    socket.on("register_user", async ({ userId, avatar }) => {
      if (!userId) return;

      await User.findByIdAndUpdate(userId, { socketId: socket.id, avatar }, { new: true });
    
    });

    // ---------------- SEND MESSAGE ----------------
    // message data: { senderId, receiverId, text, time }
    socket.on("send_message", async ({ senderId, receiverId, text, time }) => {
      if (!senderId || !receiverId || !text) return;

      // Save message in DB
      const message = await Message.create({ senderId, receiverId, text, time });

      // Emit to receiver if online
      const receiver = await User.findById(receiverId);
      if (receiver?.socketId) {
        io.to(receiver.socketId).emit("receive_message", {
          senderId,
          text,
          time,
        });
      }

      // Emit to sender to sync their chat immediately
      io.to(socket.id).emit("receive_message", {
        senderId,
        text,
        time,
      });
    });

    // ---------------- DISCONNECT ----------------
    socket.on("disconnect", async () => {
      await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
      console.log(`🔴 Disconnected: ${socket.id}`);
    });
  });
};
