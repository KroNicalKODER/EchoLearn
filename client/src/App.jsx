import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import { SidebarProvider } from "./contexts/SidebarContext";
import Main from "./pages/Main";
import { SocketProvider } from "./contexts/SocketProvider";
import RoomPage from "./pages/RoomPage";

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-white bg-background px-2 font-baloo">
        <Navbar />
        <SocketProvider>
          <SidebarProvider>
            <div className="flex">
              <Sidebar />
              <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/room/:roomId" element={<RoomPage />} />
              </Routes>
            </div>
          </SidebarProvider>
        </SocketProvider>
      </div>
    </BrowserRouter>
  );
};

export default App;
