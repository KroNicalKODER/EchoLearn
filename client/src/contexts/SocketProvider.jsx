import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";
import config from "../config";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const { user } = useAuth();

  const socket = useMemo(() => {
    const newSocket = io(config.node_url);
    if (user?.email) {
      newSocket.emit("register:user", { email: user.email });
    }
    return newSocket;
  }, [user?.email]);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
