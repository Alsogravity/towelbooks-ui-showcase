export function NotificationSkeleton() {
  return (
    <ul aria-hidden="true" className="space-y-2">
      {[0, 1, 2, 3].map((index) => (
        <li
          key={index}
          className="flex items-start gap-3 rounded-[var(--radius-paper-4)] border border-transparent bg-paper-2 px-4 py-3"
        >
          <span className="size-9 shrink-0 animate-pulse rounded-full bg-paper-3" />
          <div className="min-w-0 flex-1 space-y-2 py-1">
            <span className="block h-3.5 w-2/3 animate-pulse rounded bg-paper-3" />
            <span className="block h-3 w-1/2 animate-pulse rounded bg-paper-3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
