import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ProvedorAuth } from "./lib/autenticacao";
import { Toaster } from "./components/ui/sonner";
import "./styles.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProvedorAuth>
          <App />
          <Toaster richColors position="top-right" />
        </ProvedorAuth>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
