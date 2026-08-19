export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`relative block overflow-hidden rounded-xl bg-ink/[0.07] before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent before:animate-shimmer ${className}`}
      aria-hidden="true"
    />
  );
}
