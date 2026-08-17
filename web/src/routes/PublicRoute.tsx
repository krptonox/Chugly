import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { LoadingScreen } from "../components/LoadingScreen";

export function PublicRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return <LoadingScreen label="Loading Chugly" />;
  }

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
