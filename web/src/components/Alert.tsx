export function Alert({
  message,
  tone = "error",
}: {
  message: string;
  tone?: "error" | "success" | "info";
}) {
  const styles = {
    error: "border-coral/20 bg-coral/10 text-[#a84630]",
    success: "border-moss/20 bg-sage text-moss",
    info: "border-ink/10 bg-white/70 text-ink/70",
  };

  return (
    <div
      className={`rounded-xl border px-3.5 py-3 text-sm ${styles[tone]}`}
      role="alert"
    >
      {message}
    </div>
  );
}
