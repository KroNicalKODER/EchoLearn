import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import { useSocket } from "../contexts/SocketProvider";
import { getAllVideoCalls } from "../api/users";

const Videochat = () => {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [videoCalls, setVideoCalls] = useState([]);
  const [email, setEmail] = useState("");
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const fetchAllVideoCalls = async (email) => {
      try {
        const response = await getAllVideoCalls(email);
        console.log("Video Calls:", response);
        setVideoCalls(response);
      } catch (error) {
        console.error("Error fetching video calls:", error);
      }
    };

    if (user) {
      fetchAllVideoCalls(user.email);
    }
  }, [user]);

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
      <h1 className="text-4xl font-semibold">Videochat</h1>
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

      <div className="flex flex-col mt-5">
        <h1 className="text-2xl font-semibold">Video Calls</h1>
        <hr className="my-4 h-[0.5px] border-none bg-gray-700" />
        <div>
          {videoCalls.length > 0 ? (
            videoCalls.map((call) => (
              <div
                key={call._id}
                className="border border-gray-300 rounded mb-2"
              >
                <div
                  className="flex justify-between items-center p-3 cursor-pointer transform ease-in-out duration-200"
                  onClick={() => toggleExpand(call._id)}
                >
                  <div className="text-sm font-medium">
                    Room: {call.roomId}
                    <br />
                    Created: {new Date(call.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">
                    {expandedId === call._id ? "▲ Collapse" : "▼ Expand"}
                  </div>
                </div>

                {expandedId === call._id && (
                  <div className="px-4 pb-4 pt-2 text-sm">
                    <div className="mb-2">
                      <strong>Participants:</strong>
                      <ul className="list-disc list-inside ml-2">
                        {call.participants.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Messages:</strong>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        {call.messages.map((msg, idx) => (
                          <li key={msg._id || idx}>
                            <span className="font-semibold">{msg.email}:</span>{" "}
                            {msg.message} <br />
                            <span className="text-gray-500 text-xs">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No video calls found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Videochat;
