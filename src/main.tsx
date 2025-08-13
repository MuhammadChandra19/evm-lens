import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/index.css";
import MainPage from './pages/main';
import { Toaster } from 'sonner';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MainPage />
    <Toaster />
  </StrictMode>,
);
