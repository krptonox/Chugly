import type { ReactNode } from "react";

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
}) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
          {label}
          {required && <span className="ml-1 text-coral" aria-hidden="true">*</span>}
        </label>
        {hint && <span className="text-xs text-ink/50">{hint}</span>}
      </div>
      {children}
      {error && (
        <p id={errorId} className="text-xs font-medium text-coral-ink" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
