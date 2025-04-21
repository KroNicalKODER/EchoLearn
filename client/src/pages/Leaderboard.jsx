import { useEffect, useState } from "react";
import { getAllUsers, getOnlineUsers } from "../api/users";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  // Fetch all users once on component mount
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

  // Poll online users every 60 seconds
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const response = await getOnlineUsers();
        const onlineIds = new Set((response || []).map((user) => user._id));
        setOnlineUserIds(onlineIds);
      } catch (error) {
        console.error("Failed to fetch online users:", error);
      }
    };

    fetchOnlineUsers(); // initial fetch
    const interval = setInterval(fetchOnlineUsers, 60000);

    return () => clearInterval(interval);
  }, []);

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
