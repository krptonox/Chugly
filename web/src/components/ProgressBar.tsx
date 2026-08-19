export function ProgressBar({
  value,
  label,
  tone = "moss",
}: {
  value: number;
  label?: string;
  tone?: "moss" | "coral";
}) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-1.5">
      {label && <div className="text-xs font-semibold text-ink/50">{label}</div>}
      <div
        className="h-2 overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Room capacity"}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${tone === "coral" ? "bg-coral" : "bg-moss"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
