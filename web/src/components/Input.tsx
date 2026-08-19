import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-ink/35 hover:border-ink/25 focus:border-moss focus:ring-4 focus:ring-moss/10 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink/45 ${className}`}
      {...props}
    />
  );
}
