import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/index.css";
import { Toaster } from "sonner";
import AppProvider from "./providers/AppProvider";
import RouterWrapper from './router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 h-full">
        <AppProvider>
          <RouterWrapper />
        </AppProvider>
        <Toaster />
      </div>
    </QueryClientProvider>

  </StrictMode>,
);
