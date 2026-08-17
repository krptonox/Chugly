import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss focus:ring-4 focus:ring-moss/10 ${className}`}
      {...props}
    />
  );
}
