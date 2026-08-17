import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-5 text-center">
      <div>
        <Logo />
        <p className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-coral">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink">That page wandered off.</h1>
        <p className="mt-3 text-ink/55">The link may be old, or the page is still being built.</p>
        <Link to="/" className="mt-7 inline-flex rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-moss">
          Go home
        </Link>
      </div>
    </main>
  );
}
