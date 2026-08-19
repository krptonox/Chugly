import { Outlet } from "react-router-dom";
import { Logo } from "../components/Logo";

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-transparent px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Logo />
        <span className="hidden rounded-full bg-white/70 px-3.5 py-2 text-sm font-medium text-ink/55 shadow-sm sm:block">
          Keep your day moving.
        </span>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <section className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-coral-ink">
            Welcome to Chugly
          </p>
          <h1 className="mt-5 max-w-xl text-6xl font-black leading-[0.95] tracking-[-0.06em] text-ink">
            Make room for the things that matter.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-ink/60">
            Find people, plans, and everyday momentum close to where you are.
          </p>
          <div className="mt-12 flex gap-3">
            <span className="rounded-full bg-sage px-4 py-2 text-sm font-semibold text-moss">
              Simple by design
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink/60 shadow-sm">
              Built for real life
            </span>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <Outlet />
        </section>
      </div>
    </main>
  );
}
