import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/index.css";
import { Button } from './components/ui/button';


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="w-fit h-fit m-auto">
      <Button>ShadCN Button</Button>
    </div>
  </StrictMode>,
);
