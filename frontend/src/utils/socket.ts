import { io } from "socket.io-client";

export const socket = io("http://localhost:5002", {
  transports: ["websocket"],
});

// Connect socket after user is logged in
export const initSocket = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user?._id) return;

  socket.connect();

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
    socket.emit("join", user._id);
  });
};
