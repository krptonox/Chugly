import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "../components/ToastProvider";
import { AuthProvider } from "../features/auth/AuthProvider";
import { RealtimeProvider } from "../features/realtime/RealtimeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RealtimeProvider>
          <ToastProvider>{children}</ToastProvider>
        </RealtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
