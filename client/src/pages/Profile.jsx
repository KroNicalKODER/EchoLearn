import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-200 mb-6">Your Profile</h2>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium text-gray-300">Name:</span>
            <span className="text-white">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-300">Email:</span>
            <span className="text-white">{user.email}</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
