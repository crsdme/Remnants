import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer;

export const initSocket = (server: Server): void => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    socket.on("message", (data) => {
      console.log("Received message:", data);
      io.emit("message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: ", socket.id);
    });
  });
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
