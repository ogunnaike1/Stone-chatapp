const { Server } = require("socket.io");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // your frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  // Map to store userId -> socketId
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // Join room
    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log("👤 User joined:", userId);
    });

    // Send message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const message = {
        senderId,
        receiverId,
        text,
        createdAt: new Date(),
      };

      // Emit to sender and receiver
      if (onlineUsers.has(receiverId)) {
        io.to(onlineUsers.get(receiverId)).emit("receiveMessage", message);
      }
      if (onlineUsers.has(senderId)) {
        io.to(onlineUsers.get(senderId)).emit("receiveMessage", message);
      }

      console.log("📨 Message sent:", message);
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log("❌ User disconnected:", socket.userId);
      }
    });
  });
};
