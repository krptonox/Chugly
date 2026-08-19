import type { ReactNode } from "react";

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-ink/15 bg-white/70 px-6 py-12 text-center shadow-sm">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sage text-xl font-black text-moss" aria-hidden="true">
        •
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-coral-ink">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
        {description}
      </p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
