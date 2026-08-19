import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "../components/ToastProvider";
import { AuthProvider } from "../features/auth/AuthProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
