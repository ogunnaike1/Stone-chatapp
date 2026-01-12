const { Server } = require("socket.io");

const socketServer = (server) =>{
    const io = new Server(server, {
        cors: {
          origin: "*", // change to frontend URL later
          methods: ["GET", "POST"]
        }
      });

      io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
    
        // Join personal room
        socket.on("join", (userId) => {
          socket.join(userId);
         
        });
    
        // Send message
        socket.on("send_message", (data) => {
          const { receiverId, message } = data;
    
          // Send message to receiver room
          io.to(receiverId).emit("receive_message", {
            senderId: socket.id,
            message
          });
        });
    
        socket.on("disconnect", () => {
          console.log("User disconnected:", socket.id);
        });
      });
    
      return io;
}