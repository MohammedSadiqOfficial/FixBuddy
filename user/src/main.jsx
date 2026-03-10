import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { Toaster } from "./components/ui/sonner.jsx";
import { ThemeProvider } from "./components/theme-provider.jsx";

createRoot(document.getElementById("root")).render(
    // <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="fixxr-user-theme">
        <AuthProvider>
            <SocketProvider>
                <App />
            </SocketProvider>
        </AuthProvider>
        <Toaster position="top-right" richColors />
    </ThemeProvider>
    /* </React.StrictMode>, */
);
