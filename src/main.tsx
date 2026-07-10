import React from "react";
import { createRoot } from "react-dom/client";
import App from "./MatchdayApp";
import "./styles.css";
import "./matchday.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
