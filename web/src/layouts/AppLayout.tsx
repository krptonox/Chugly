import { Link, NavLink, Outlet } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { MobileNav } from "../components/MobileNav";
import { useAuth } from "../features/auth/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/rooms", label: "Rooms" },
  { to: "/account", label: "Account" },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const initial = (user?.username || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3.5 sm:px-8 lg:px-12">
          <Logo />
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-sage text-moss"
                      : "text-ink/55 hover:bg-white/70 hover:text-ink"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              to="/account"
              className="group flex items-center gap-2 rounded-xl p-1.5 text-right transition hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-moss/30"
            >
              <span className="hidden sm:block">
                <span className="block text-sm font-bold text-ink group-hover:text-moss">
                  {user?.username}
                </span>
                <span className="block text-xs text-ink/45">Your account</span>
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sage text-sm font-black uppercase text-moss">
                {initial}
              </span>
            </Link>
            <Button
              variant="secondary"
              className="hidden min-h-9 px-3 text-xs sm:inline-flex"
              onClick={() => void logout()}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-7 pb-24 sm:px-8 sm:py-9 sm:pb-12 lg:px-12 lg:py-12">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
