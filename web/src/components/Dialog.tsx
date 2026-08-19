import { useEffect, useRef, type ReactNode } from "react";

export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-end bg-ink/40 p-4 backdrop-blur-[2px] sm:place-items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="w-full max-w-md animate-fade-up rounded-3xl border border-ink/10 bg-white p-6 shadow-lift sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="text-xl font-black text-ink">{title}</h2>
            {description && (
              <p id="dialog-description" className="mt-2 text-sm leading-6 text-ink/60">
                {description}
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xl text-ink/45 transition hover:bg-cream hover:text-ink"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}
