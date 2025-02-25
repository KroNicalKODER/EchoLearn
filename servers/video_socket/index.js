import  { Server } from "socket.io";

const io = new Server(8000, {
    cors: true
});

const RoomIdToSocketId = new Map();
const SocketIdToRoomId = new Map();

io.on("connection", (socket) => {
  console.log("a user connected id: ", socket.id);
  socket.on("room:join", (data) => {
    const {roomId, password, email} = data
    RoomIdToSocketId.set(roomId, socket.id);
    SocketIdToRoomId.set(socket.id, roomId);
    io.to(roomId).emit("user:joined", {email, id: socket.id, password, roomId})
    socket.join(roomId);
    io.to(socket.id).emit("room:join", data)
  });

  socket.on("user:call", ({to, offer})=>{
    // console.log("user call to : ", to, "offer: ", offer)
    io.to(to).emit("incomming:call", {from: socket.id, offer})
  })

  socket.on("call:accepted", ({to, ans})=>{
    io.to(to).emit("call:accepted", {from: socket.id, ans})
  })

  socket.on("peer:nego:needed", ({to, offer})=>{
    io.to(to).emit("peer:nego:needed", {from: socket.id, offer})
  })

  socket.on("peer:nego:done", ({to, ans})=>{
    io.to(to).emit("peer:nego:final", {from: socket.id, ans})
  })

})

