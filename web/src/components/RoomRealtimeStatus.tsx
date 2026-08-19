import { Badge } from "./Badge";
import { useRealtime } from "../features/realtime/RealtimeProvider";
import type { RealtimeStatus } from "../features/realtime/realtime.types";

const statusContent: Record<
  RealtimeStatus,
  { label: string; tone: "neutral" | "moss" | "coral" }
> = {
  connected: {
    label: "Live updates on",
    tone: "moss",
  },
  connecting: {
    label: "Connecting live updates…",
    tone: "neutral",
  },
  reconnecting: {
    label: "Reconnecting live updates…",
    tone: "neutral",
  },
  disconnected: {
    label: "Live updates disconnected",
    tone: "neutral",
  },
  unavailable: {
    label: "Live updates unavailable",
    tone: "coral",
  },
  disabled: {
    label: "Live updates disabled",
    tone: "neutral",
  },
};

export function RoomRealtimeStatus({
  className = "",
}: {
  className?: string;
}) {
  const { status } = useRealtime();
  const content = statusContent[status];

  return (
    <Badge
      tone={content.tone}
      className={`normal-case tracking-normal ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "connected"
            ? "bg-moss"
            : status === "unavailable"
              ? "bg-coral-ink"
              : "bg-ink/35"
        }`}
        aria-hidden="true"
      />
      <span role="status" aria-live="polite">
        {content.label}
      </span>
    </Badge>
  );
}
