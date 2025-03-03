import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import { SidebarProvider } from "./contexts/SidebarContext";
import { SocketProvider } from "./contexts/SocketProvider";
import { AuthProvider } from "./contexts/AuthContext";
import AppRouter from "./routes/Router";

const App = () => {

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen text-white bg-background px-2 font-baloo">
          <Navbar />
          <SocketProvider>
            <SidebarProvider>
              <div className="flex">
                <Sidebar />
                <AppRouter />
              </div>
            </SidebarProvider>
          </SocketProvider>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
