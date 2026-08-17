export function LoadingScreen({
  label = "Loading",
}: {
  label?: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-6">
      <div className="flex items-center gap-3 text-sm font-semibold text-ink/60">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-moss border-t-transparent" />
        {label}
      </div>
    </main>
  );
}
