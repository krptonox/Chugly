import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Home", icon: "⌂" },
  { to: "/rooms", label: "Rooms", icon: "○" },
  { to: "/account", label: "Account", icon: "·" },
];

export function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-cream/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(23,32,24,0.08)] backdrop-blur sm:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold transition ${
                isActive ? "bg-sage text-moss" : "text-ink/50 hover:bg-white hover:text-ink"
              }`
            }
          >
            <span className="text-base leading-none" aria-hidden="true">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
