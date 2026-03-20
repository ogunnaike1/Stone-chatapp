import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5002", {
  autoConnect: false,          // ← don't connect until we tell it to
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 3000,
  timeout: 20000,
});