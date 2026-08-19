import { Skeleton } from "./Skeleton";

export function MemberRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-4 last:border-b-0" aria-hidden="true">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40 max-w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
