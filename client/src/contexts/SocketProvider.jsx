import React, {createContext, useContext, useMemo} from "react";
import { io } from "socket.io-client";
import config from "../config";

const SocketContext = createContext();

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}

export const SocketProvider = (props) => {

    const socket = useMemo(() => {
        return io(config.node_url)
    }, [])

     return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}