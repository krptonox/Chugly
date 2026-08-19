import { Alert } from "./Alert";
import { Button } from "./Button";
import type { GeolocationStatus } from "../features/rooms/room.types";

type LocationStatusProps = {
  status: GeolocationStatus;
  errorMessage: string;
  onRetry: () => void;
  compact?: boolean;
};

export function LocationStatus({
  status,
  errorMessage,
  onRetry,
  compact = false,
}: LocationStatusProps) {
  if (status === "loading") {
    return <Alert tone="info" message="Finding your current location…" />;
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-moss/15 bg-sage px-3.5 py-3 text-sm font-semibold text-moss" role="status">
        <span aria-hidden="true">✓</span>
        Current location ready.
      </div>
    );
  }

  if (status === "permission-denied" || status === "unavailable" || status === "timeout" || status === "unsupported") {
    return (
      <div className="space-y-3">
        <Alert message={errorMessage} />
        <Button variant="secondary" className={compact ? "min-h-10 text-xs" : ""} onClick={onRetry}>
          Try location again
        </Button>
      </div>
    );
  }

  return <Alert tone="info" message="Location is needed to find nearby rooms." />;
}
