import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./theme/ThemeProvider.tsx";
import { BackendErrorProvider } from "./contexts/BackendErrorContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BackendErrorProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </BackendErrorProvider>
    </ThemeProvider>
  </StrictMode>,
);
