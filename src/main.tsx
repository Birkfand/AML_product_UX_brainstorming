import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import AmlFlow from "./components/aml/AmlFlow";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AmlFlow />
  </StrictMode>
);
