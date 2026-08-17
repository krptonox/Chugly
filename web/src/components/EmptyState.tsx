export function EmptyState({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-ink/15 bg-white/60 px-6 py-12 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">
        {description}
      </p>
    </div>
  );
}
