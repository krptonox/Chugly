export function LoadingScreen({
  label = "Loading",
}: {
  label?: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-6">
      <div className="flex flex-col items-center gap-4 text-center" role="status" aria-live="polite">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral text-xl font-black text-white shadow-sm" aria-hidden="true">
          c
        </span>
        <div className="flex items-center gap-3 text-sm font-semibold text-ink/60">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-moss border-t-transparent" aria-hidden="true" />
          {label}
        </div>
      </div>
    </main>
  );
}
