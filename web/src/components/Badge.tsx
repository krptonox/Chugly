import type { ReactNode } from "react";

const styles = {
  neutral: "bg-cream text-ink/60",
  moss: "bg-sage text-moss",
  coral: "bg-coral/10 text-coral-ink",
  dark: "bg-white/15 text-white",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof styles;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${styles[tone]} ${className}`}>
      {children}
    </span>
  );
}
