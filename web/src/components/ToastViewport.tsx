import type { ToastTone } from "./ToastProvider";

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Array<{ id: number; message: string; tone: ToastTone }>;
  onDismiss: (id: number) => void;
}) {
  const styles = {
    success: "border-moss/20 bg-sage text-moss",
    error: "border-coral/25 bg-[#fff0eb] text-coral-ink",
    info: "border-info-ink/15 bg-[#edf4f5] text-info-ink",
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lift ${styles[toast.tone]}`}
          role={toast.tone === "error" ? "alert" : "status"}
        >
          <span aria-hidden="true">{toast.tone === "success" ? "✓" : toast.tone === "info" ? "i" : "!"}</span>
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            className="rounded-md px-1 text-current/60 hover:bg-black/5 hover:text-current"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
