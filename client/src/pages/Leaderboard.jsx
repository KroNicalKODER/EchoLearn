import { useEffect, useState } from "react";
import { getAllUsers, getOnlineUsers } from "../api/users";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketProvider";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const response = await getOnlineUsers();
        const onlineUsersSet = new Set(response.map((user) => user.email));
        setOnlineUsers(onlineUsersSet);
        const onlineIds = new Set((response || []).map((user) => user._id));
        setOnlineUserIds(onlineIds);
      } catch (error) {
        console.error("Failed to fetch online users:", error);
      }
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.on("call:requested", ({ fromName, fromSocketId, roomId }) => {
      console.log("call req", fromSocketId);
      if (fromName === currentUser.name) return;

      if (window.confirm(`${fromName} is requesting a video call. Accept?`)) {
        // Join the room first
        console.log("Joining room:", roomId);
        socket.emit("room:join", {
          roomId,
          password: "123",
          email: currentUser.email,
        });

        // Then accept the call
        socket.emit("call:accepted", {
          roomId,
          to: socket.id,
          fromName,
        });

        navigate(`/room/${roomId}`);
      }
    });

    socket.on("call:accepted", ({ roomId, fromName }) => {
      if (fromName !== currentUser.name) return;
      navigate(`/room/${roomId}`);
    });

    return () => {
      socket.off("call:requested");
      socket.off("call:accepted");
    };
  }, [navigate, socket, currentUser.name, currentUser.email]);

  const handleCallRequest = (user) => {
    const roomId = uuidv4();

    // Emit room join event first
    socket.emit("room:join", {
      roomId,
      password: "123",
      email: currentUser.email,
    });

    // Then emit the call request
    socket.emit("call:request", {
      toUserEmail: user.email,
      fromSocketId: socket.id,
      fromName: currentUser.name,
      roomId,
    });
  };

  return (
    <div className="bg-transparent p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4 text-white">Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Score</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-800">
                <td className="px-4 py-2 text-gray-100">{user.name}</td>
                <td className="px-4 py-2 text-gray-400">{user.email}</td>
                <td className="px-4 py-2 text-gray-200">{user.score || 0}</td>
                <td className="px-4 py-2">
                  {onlineUserIds.has(user._id) ? (
                    <span className="text-green-400">Online</span>
                  ) : (
                    <span className="text-gray-500">Offline</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {onlineUsers.has(user.email) &&
                    user.email !== currentUser.email && (
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        onClick={() => handleCallRequest(user)}
                      >
                        Call
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
