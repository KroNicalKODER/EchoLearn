import React, { useEffect } from "react";
import Leaderboard from "./Leaderboard";
import Aitutor from "./Aitutor";
import Profile from "./Profile";
import Videochat from "./Videochat";
import { useSidebar } from "../contexts/SidebarContext";
import DailyChallenge from "./DailyChallenge";
import Translate from "./Translate";
import { setOnline, setOffline } from "../api/users";
import { useAuth } from "../contexts/AuthContext";

const Main = () => {
  const { selectedItem } = useSidebar();
  const { user } = useAuth();
  const email = user?.email;

  useEffect(() => {
    if (!email) return;

    // Set online on mount
    setOnline(email);

    // Set offline on tab close or refresh
    const handleUnload = () => {
      setOffline(email);
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      setOffline(email);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [email]);

  return (
    <div className="my-10 sm:ml-13 mx-4 w-full">
      {selectedItem === "Leaderboard" && <Leaderboard />}
      {selectedItem === "AI Tutor" && <Aitutor />}
      {selectedItem === "Profile" && <Profile />}
      {selectedItem === "Video Call" && <Videochat />}
      {selectedItem === "Daily Challenge" && <DailyChallenge />}
      {selectedItem === "Translate" && <Translate />}
    </div>
  );
};

export default Main;
