const styles = {
  error: "border-coral/25 bg-coral/10 text-coral-ink",
  success: "border-moss/20 bg-sage text-moss",
  info: "border-info-ink/15 bg-[#edf4f5] text-info-ink",
};

export function Alert({
  message,
  tone = "error",
}: {
  message: string;
  tone?: "error" | "success" | "info";
}) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${styles[tone]}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      <span className="mt-0.5 text-xs font-black" aria-hidden="true">
        {tone === "success" ? "✓" : tone === "info" ? "i" : "!"}
      </span>
      <span>{message}</span>
    </div>
  );
}
