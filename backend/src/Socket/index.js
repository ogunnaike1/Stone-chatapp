const { Server } = require("socket.io");
const User = require("../Model/UserModel");
const Message = require("../Model/MessageModel");

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    // ── REGISTER USER ──
    socket.on("register_user", async (userId) => {
      if (!userId) return;
      await User.findByIdAndUpdate(userId, { socketId: socket.id });
      console.log("✅ User registered:", userId);
    });

    // ── SEND MESSAGE ──
    socket.on("send_message", async ({ senderId, receiverId, text, messageId }) => {
      if (!senderId || !receiverId || !text || !messageId) return;

      const message = await Message.create({ senderId, receiverId, text });

      const payload = {
        from: senderId,
        to: receiverId,
        text,
        messageId,
        createdAt: message.createdAt,
      };

      // Emit to receiver only
      const receiver = await User.findById(receiverId);
      if (receiver?.socketId) {
        io.to(receiver.socketId).emit("receive_message", payload);
      }
    });

    // ── SEND FRIEND REQUEST ──
    // Frontend emits: socket.emit("send_friend_request", { fromId, toId })
    socket.on("send_friend_request", async ({ fromId, toId }) => {
      if (!fromId || !toId) return;

      const sender = await User.findById(fromId).select("username profilePicture");
      if (!sender) return;

      const receiver = await User.findById(toId);
      if (!receiver?.socketId) return;

      // Notify the receiver in real-time
      io.to(receiver.socketId).emit("friend_request_received", {
        fromId,
        fromName: sender.username,
        fromAvatar: sender.profilePicture || null,
      });

      console.log(`📨 Friend request: ${sender.username} → ${toId}`);
    });

    // ── ACCEPT FRIEND REQUEST ──
    // Frontend emits: socket.emit("accept_friend_request", { fromId, toId })
    // fromId = the person who originally sent the request
    // toId   = the person who just accepted it
    socket.on("accept_friend_request", async ({ fromId, toId }) => {
      if (!fromId || !toId) return;

      const accepter = await User.findById(toId).select("username profilePicture");
      if (!accepter) return;

      const originalSender = await User.findById(fromId);
      if (!originalSender?.socketId) return;

      // Notify original sender that their request was accepted
      io.to(originalSender.socketId).emit("friend_request_accepted", {
        byId: toId,
        byName: accepter.username,
        byAvatar: accepter.profilePicture || null,
      });

      console.log(`✅ Friend request accepted: ${accepter.username} accepted ${fromId}'s request`);
    });

    // ── DISCONNECT ──
    socket.on("disconnect", async () => {
      await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
      console.log("🔴 Disconnected:", socket.id);
    });
  });
};