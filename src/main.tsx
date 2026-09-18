import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";


// Register Unified Service Worker for PWA & OneSignal
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/OneSignalSDKWorker.js", { scope: "/" })
      .then((reg) => {
        console.log("[PWA] Unified OneSignal ServiceWorker registered with scope:", reg.scope);
      })
      .catch((err) => {
        console.warn("[PWA] ServiceWorker registration error:", err);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
