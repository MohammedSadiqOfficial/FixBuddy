import React, { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, captain, isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      if (captain?.id) {
        newSocket.emit("register_captain", captain.id);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => newSocket.close();
  }, [isAuthenticated, token, captain]);

  // Lightweight location sharing for pages that do not own their own live map.
  useEffect(() => {
    if (!socket || !captain?.id) return;
    
    const locationInterval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("update_location", { captainId: captain.id, latitude, longitude });
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      }
    }, 15000);

    return () => clearInterval(locationInterval);
  }, [socket, captain]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
