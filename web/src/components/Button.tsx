import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-ink text-white shadow-sm hover:-translate-y-0.5 hover:bg-moss active:translate-y-0",
  secondary:
    "border border-ink/15 bg-white text-ink hover:-translate-y-0.5 hover:border-moss hover:text-moss active:translate-y-0",
  ghost:
    "text-ink/70 hover:bg-sage/60 hover:text-ink",
  danger:
    "bg-coral text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#d96649] active:translate-y-0",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: keyof typeof variants;
  loading?: boolean;
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-moss/30 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
