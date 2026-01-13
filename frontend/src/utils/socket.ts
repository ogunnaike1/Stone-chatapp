import { io } from "socket.io-client";

export const socket = io("http://localhost:5002", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Client connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket error:", err.message);
});
