import { Link } from "react-router-dom";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral text-lg font-black text-white shadow-sm">
        c
      </span>
      <span className={`text-xl font-black tracking-tight ${light ? "text-white" : "text-ink"}`}>
        chugly<span className="text-coral">.</span>
      </span>
    </Link>
  );
}
