import type { ReactNode } from "react";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-ink/55">{description}</p>
      <div className="mt-7">{children}</div>
      {footer && (
        <div className="mt-6 border-t border-ink/10 pt-5 text-center text-sm text-ink/55">
          {footer}
        </div>
      )}
    </div>
  );
}
