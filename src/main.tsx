import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import App from "./App";
import { ToastProvider } from "./components/ui/Toast";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://dummy.convex.cloud";

if (!import.meta.env.VITE_CONVEX_URL) {
  console.warn("VITE_CONVEX_URL is missing. Please run `npx convex dev` to link your backend.");
}

const convex = new ConvexReactClient(convexUrl);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </ConvexAuthProvider>
  </React.StrictMode>
);
