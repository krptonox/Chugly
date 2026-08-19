import type { ReactNode } from "react";

export function RadioCardGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; title: string; description: string; icon?: ReactNode }>;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`text-left rounded-2xl border p-4 transition focus:outline-none focus:ring-2 focus:ring-moss/30 ${selected ? "border-moss bg-sage/60 shadow-sm" : "border-ink/10 bg-white hover:border-moss/40 hover:bg-cream"}`}
          >
            <span className="flex items-start justify-between gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-moss shadow-sm" aria-hidden="true">
                {option.icon}
              </span>
              <span className={`mt-1 grid h-5 w-5 place-items-center rounded-full border ${selected ? "border-moss bg-moss text-white" : "border-ink/20 text-transparent"}`} aria-hidden="true">
                ✓
              </span>
            </span>
            <span className="mt-4 block font-bold text-ink">{option.title}</span>
            <span className="mt-1 block text-sm leading-5 text-ink/55">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}
