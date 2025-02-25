import React, { createContext, useContext, useEffect, useState } from "react";

// Create the context
const SidebarContext = createContext();

// Context Provider Component
export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 640);
  const [selectedItem, setSelectedItem] = useState("AI Tutor");

  // Function to handle window resize
  const handleResize = () => {
    setIsSidebarOpen(window.innerWidth > 640);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    
    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <SidebarContext.Provider value={{ selectedItem, setSelectedItem, isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook to use the sidebar context
export const useSidebar = () => useContext(SidebarContext);
