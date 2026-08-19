import { Skeleton } from "./Skeleton";

export function RoomCardSkeleton() {
  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-card" aria-hidden="true">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-2.5 w-full max-w-xs" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-11 w-24 shrink-0" />
      </div>
    </div>
  );
}
