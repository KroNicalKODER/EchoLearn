import { Server } from "socket.io";

const io = new Server(8000, {
  cors: {
    origin: "*", // Adjust to your frontend's origin in production
  },
});

const RoomIdToSocketId = new Map();
const SocketIdToRoomId = new Map();

const userIdToSocketId = new Map();
const socketIdToUserId = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Associate user ID with socket (used for Leaderboard call invites)
  socket.on("register:user", ({ email }) => {
    console.log("register", email);
    userIdToSocketId.set(email, socket.id);
    socketIdToUserId.set(socket.id, email);
  });

  // For joining video call room
  socket.on("room:join", (data) => {
    const { roomId, password, email } = data;
    RoomIdToSocketId.set(roomId, socket.id);
    SocketIdToRoomId.set(socket.id, roomId);
    socket.join(roomId);

    console.log("User joined room:", roomId, email, password, socket.id);

    io.to(roomId).emit("user:joined", {
      email,
      id: socket.id,
      password,
      roomId,
    });

    io.to(socket.id).emit("room:join", data);
  });

  // Core WebRTC signaling
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  // Room message broadcast
  socket.on("room:message", ({ roomId, message, email }) => {
    io.to(roomId).emit("room:message", { message, roomId, email });
  });

  // Leaderboard video call request
  socket.on(
    "call:request",
    ({ toUserEmail, fromSocketId, fromName, roomId }) => {
      const toSocketId = userIdToSocketId.get(toUserEmail);
      console.log('"call request", toSocketId, fromSocketId);', toSocketId);
      if (toSocketId) {
        io.emit("call:requested", {
          fromName,
          fromSocketId,
          roomId,
        });
      }
    }
  );

  // Leaderboard call accept
  socket.on("call:accepted", ({ roomId, to, fromName }) => {
    console.log("call accepted", roomId, to, fromName);
    io.emit("call:accepted", { roomId, fromName });
  });

  socket.on("disconnect", () => {
    // Clean up room tracking
    const roomId = SocketIdToRoomId.get(socket.id);
    if (roomId) {
      RoomIdToSocketId.delete(roomId);
      SocketIdToRoomId.delete(socket.id);
      io.to(roomId).emit("user:left", { id: socket.id });
    }

    // Clean up leaderboard tracking
    const userId = socketIdToUserId.get(socket.id);
    if (userId) {
      userIdToSocketId.delete(userId);
    }
    socketIdToUserId.delete(socket.id);
  });
});
