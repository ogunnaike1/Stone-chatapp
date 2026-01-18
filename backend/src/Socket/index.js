const { Server } = require("socket.io");

module.exports = (server) => {
  console.log("🔥 Socket server initialized");

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("join_room", (roomNumber) => {
      socket.join(roomNumber);
      console.log(`📦 Joined room number: ${roomNumber}`);
    });

    socket.on("send_message", ({ roomNumber, message }) => {
      io.to(roomNumber).emit("receive_message", {
        message,
        roomNumber,
      });
    });
  });


  
};
