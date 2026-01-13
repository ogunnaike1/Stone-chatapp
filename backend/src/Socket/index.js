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

    socket.on("send_message", (data)=>{
        console.log("message from cilent", data)
        socket.broadcast.emit("receive_message", data)
    })

//     socket.on("send_message", (data) => {
//       console.log("📩 Message from client:", data);

//       socket.emit("receive_message", {
//         reply: "Hello from server 👋",
//       });
//     });

//     socket.on("disconnect", () => {
//       console.log("❌ User disconnected:", socket.id);
//     });
  });
};
