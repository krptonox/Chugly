import { Link } from "react-router-dom";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-moss/30"
      aria-label="Chugly home"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral text-lg font-black text-white shadow-sm">
        c
      </span>
      <span className={`text-xl font-black tracking-tight ${light ? "text-white" : "text-ink"}`}>
        chugly<span className="text-coral">.</span>
      </span>
    </Link>
  );
}
