import type { ReactNode } from "react";

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-sm font-semibold text-ink"
        >
          {label}
        </label>
        {hint && <span className="text-xs text-ink/45">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-xs font-medium text-coral" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
