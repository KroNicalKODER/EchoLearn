import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import { useSocket } from "../contexts/SocketProvider";

const Videochat = () => {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { user } = useAuth();

  const navigate = useNavigate();

  const socket = useSocket();

  const handleCreateRoom = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { roomId, password, email: user.email });
    },
    [roomId, password, socket, user.email]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { roomId, password, email } = data;

      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket]);

  return (
    <div className="w-full">
      <h1 className="text-4xl font-semibold">Videochat Form-</h1>
      <hr className="my-4 h-[0.5px] border-none bg-gray-700" />
      <div className="sm:flex text-sm my-5 sm:justify-between sm:gap-4 sm:pr-4  w-full">
        <div className="flex-1">
          <input
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full bg-input-bg border-input-border outline-none border-[1px] px-3 focus:border-input-border focus:border-[1px] rounded-xs my-1 py-2"
            type="text"
            placeholder="Enter Room Id"
          />
        </div>
        <div className="flex-1">
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-input-bg border-input-border outline-none border-[1px] px-3 focus:border-input-border focus:border-[1px] rounded-xs my-1 py-2"
            type="text"
            placeholder="Enter Email"
          />
        </div>
        <div className="flex-1">
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-input-bg border-input-border outline-none border-[1px] px-3 focus:border-input-border focus:border-[1px] rounded-xs my-1 py-2"
            type="password"
            placeholder="Enter Password"
          />
        </div>
      </div>
      <div className="flex w-full justify-center items-center">
        <button className="text-sm  text-white px-3 py-1 rounded-xs bg-[#D77E2D] cursor-pointer">
          Join Room
        </button>
        <button
          onClick={handleCreateRoom}
          className="text-sm  text-white px-3 py-1 rounded-xs ml-4 bg-[#FF00D6]  cursor-pointer"
        >
          Create Room
        </button>
        <button className="text-sm hidden sm:flex text-white px-3 py-1 rounded-xs ml-4 bg-[#D77E2D] cursor-pointer">
          Leaderboard
        </button>
      </div>
    </div>
  );
};

export default Videochat;
