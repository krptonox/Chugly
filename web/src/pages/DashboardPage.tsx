import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../features/auth/useAuth";

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.fullname?.split(" ")[0] || user?.username || "there";

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-ink px-6 py-8 text-white shadow-soft sm:px-10 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">
          Your Chugly space
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">
          Good to see you, {firstName}.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
          Your workspace is ready. The next layer of Chugly is coming together here.
        </p>
      </section>

      <EmptyState
        eyebrow="The good stuff is next"
        title="Your workspace is ready for its first idea."
        description="Authentication is connected. This is the starting point for Chugly's core product features."
      />

      <div className="flex flex-wrap gap-3">
        <Link
          to="/account"
          className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:text-moss"
        >
          View account
        </Link>
        <Link
          to="/account/change-password"
          className="rounded-xl border border-ink/10 px-4 py-3 text-sm font-bold text-ink/60 transition hover:border-moss hover:text-moss"
        >
          Manage password
        </Link>
      </div>
    </div>
  );
}
