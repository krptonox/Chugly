import { Link, NavLink, Outlet } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { useAuth } from "../features/auth/useAuth";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-12">
          <Logo />
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-sage text-moss" : "text-ink/55 hover:text-ink"}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/account"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-sage text-moss" : "text-ink/55 hover:text-ink"}`
              }
            >
              Account
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/account"
              className="hidden text-right sm:block"
            >
              <p className="text-sm font-bold text-ink">
                {user?.username}
              </p>
              <p className="text-xs text-ink/45">Your account</p>
            </Link>
            <Button
              variant="secondary"
              className="min-h-9 px-3 text-xs"
              onClick={() => void logout()}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <Outlet />
      </main>
    </div>
  );
}
