import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/index.css";
import MainPage from "./pages/main";
import { Toaster } from "sonner";
import AppProvider from "./providers/AppProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 h-full">
      <AppProvider>
        <MainPage />
      </AppProvider>
      <Toaster />
    </div>
  </StrictMode>,
);
