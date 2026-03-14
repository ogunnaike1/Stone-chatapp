const { Server } = require("socket.io");
const User    = require("../Model/UserModel");
const Message = require("../Model/MessageModel");

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    // ── REGISTER USER ──────────────────────────────────────────────────────────
    socket.on("register_user", async (userId) => {
      if (!userId) return;
      await User.findByIdAndUpdate(userId, { socketId: socket.id });
      console.log("✅ User registered:", userId);
    });

    // ── SEND MESSAGE ───────────────────────────────────────────────────────────
    // Frontend emits:
    //   { senderId, receiverId, text, messageId, attachments: [] }
    // attachments shape: [{ type, url, name, sizeLabel }]
    socket.on("send_message", async ({ senderId, receiverId, text, messageId, attachments = [] }) => {
      if (!senderId || !receiverId) return;
      if (!text && attachments.length === 0) return; // nothing to send

      // Save to DB — include attachments so they survive page refresh
      const message = await Message.create({
        senderId,
        receiverId,
        text: text || "",
        attachments,            // ← persisted
      });

      const payload = {
        from:        senderId,
        to:          receiverId,
        text:        text || "",
        messageId,
        attachments,            // ← forwarded to receiver
        createdAt:   message.createdAt,
      };

      // Emit to receiver only
      const receiver = await User.findById(receiverId);
      if (receiver?.socketId) {
        io.to(receiver.socketId).emit("receive_message", payload);
      }
    });

    // ── SEND FRIEND REQUEST ────────────────────────────────────────────────────
    socket.on("send_friend_request", async ({ fromId, toId }) => {
      if (!fromId || !toId) return;

      const sender   = await User.findById(fromId).select("username profilePicture");
      if (!sender) return;

      const receiver = await User.findById(toId);
      if (!receiver?.socketId) return;

      io.to(receiver.socketId).emit("friend_request_received", {
        fromId,
        fromName:   sender.username,
        fromAvatar: sender.profilePicture || null,
      });

      console.log(`📨 Friend request: ${sender.username} → ${toId}`);
    });

    // ── ACCEPT FRIEND REQUEST ──────────────────────────────────────────────────
    socket.on("accept_friend_request", async ({ fromId, toId }) => {
      if (!fromId || !toId) return;

      const accepter = await User.findById(toId).select("username profilePicture");
      if (!accepter) return;

      const originalSender = await User.findById(fromId);
      if (!originalSender?.socketId) return;

      io.to(originalSender.socketId).emit("friend_request_accepted", {
        byId:     toId,
        byName:   accepter.username,
        byAvatar: accepter.profilePicture || null,
      });

      console.log(`✅ Friend request accepted: ${accepter.username} accepted ${fromId}'s request`);
    });

    // ── DISCONNECT ─────────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
      console.log("🔴 Disconnected:", socket.id);
    });
  });
};