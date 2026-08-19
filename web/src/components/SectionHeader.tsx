import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral-ink">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
