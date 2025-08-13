import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/index.css";
import MainPage from './pages/main';
import { Toaster } from 'sonner';
import EvmProviders from './providers/EvmProviders';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EvmProviders>
      <MainPage />
      <Toaster />
    </EvmProviders>
  </StrictMode>,
);
