import React, { useState } from "react";
import { Link } from "react-router-dom";

import { useSidebar } from "../contexts/SidebarContext";

import "./Sidebar.css";

const Sidebar = () => {
  const { selectedItem, setSelectedItem, isSidebarOpen } = useSidebar();

  const [tempSidebarOpen, setTempSidebarOpen] = useState(false);

  const menuItems = [
    { name: "AI Tutor", icon: "bi bi-award" },
    { name: "Leaderboard", icon: "bi bi-clipboard2-pulse" },
    { name: "Video Call", icon: "bi bi-camera-video" },
    { name: "Profile", icon: "bi bi-person" },
    { name: "Daily Challenge", icon: "bi bi-trophy" },
    { name: "Translate", icon: "bi bi-translate" },
  ];

  return (
    <>
      {!isSidebarOpen && !tempSidebarOpen && (
        <div className="absolute">
          <button
            onClick={(e) => setTempSidebarOpen(true)}
            className="ml-3 cursor-pointer px-1 py-1"
          >
            <i className="bi bi-list"></i>
          </button>
        </div>
      )}

      {!isSidebarOpen && (
        
        <div className={`fixed ml-4 my-5 bg-[rgb(255,255,255,20%)] h-[calc(100vh-20vh)] w-[calc(60vw)] backdrop-blur-[10px] rounded-md px-5 py-6 transform border-gray-700 transition-transform duration-300 ease-in-out ${tempSidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+180px)]"}`}>
          <ul className="flex flex-col">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className={`relative rounded-xs flex w-[150px] items-center cursor-pointer hover:px-3 ease-in-out duration-300 py-3 border-gray-800 text-sm ${
                  selectedItem === item.name
                    ? "px-3 rounded-r-3xl bg-linear-[90deg,#984900_4.85%,#FFA149_100%] text-white font-semibold"
                    : ""
                }`}
                onClick={() => setSelectedItem(item.name)}
              >
                <span className="mr-2">
                  <i className={item.icon}></i>
                </span>
                <span>{item.name}</span>
                {selectedItem !== item.name && (
                  <span className="absolute right-2 ease-in-out duration-300 arrow-transition">
                    &lt;
                  </span>
                )}
              </li>
            ))}
            <li className="relative"><button className="absolute text-xl right-2 cursor-pointer py-4" onClick={e => setTempSidebarOpen(false)}><i class="bi bi-list"></i></button></li>
          </ul>
        </div>
      )}

      {isSidebarOpen && (
        <div className="ml-4 my-5 py-5 border-gray-700">
          <ul className="flex flex-col">
            {menuItems.map((item) => (
              <Link to={`/`} key={item.name}>
              <li
                
                className={`relative rounded-xs flex w-[150px] items-center cursor-pointer hover:px-3 ease-in-out duration-300 py-3 border-b border-gray-800 text-sm ${
                  selectedItem === item.name
                  ? "px-3 rounded-r-3xl bg-linear-[90deg,#984900_4.85%,#FFA149_100%] text-white font-semibold"
                  : ""
                }`}
                onClick={() => setSelectedItem(item.name)}
                >
                <span className="mr-2">
                  <i className={item.icon}></i>
                </span>
                <span>{item.name}</span>
                {selectedItem !== item.name && (
                  <span className="absolute right-2 ease-in-out duration-300 arrow-transition">
                    &lt;
                  </span>
                )}
              </li>
                </Link>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Sidebar;
