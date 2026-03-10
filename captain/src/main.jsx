import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { Toaster } from "./components/ui/sonner.jsx";
import { ThemeProvider } from "./components/theme-provider.jsx";
import { BrowserRouter } from "react-router-dom"

createRoot(document.getElementById("root")).render(
	// <StrictMode>
	<BrowserRouter>
		<ThemeProvider
			defaultTheme="light"
			storageKey="fixxr-captain-theme">
			<AuthProvider>
				<SocketProvider>
					<App />
				</SocketProvider>
			</AuthProvider>
		</ThemeProvider>
		<Toaster position="top-right" richColors />
	</BrowserRouter>
	// </StrictMode>,
);
