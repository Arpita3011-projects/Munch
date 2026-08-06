import Card from '../../ui/Card';
import Skeleton from '../../ui/Skeleton';

/**
 * Loading skeletons for the analytics dashboard — shown while the
 * /admin/analytics request is in flight. Mirrors the final layout so the
 * transition to real data feels seamless.
 */

export function StatCardSkeleton() {
  return (
    <Card className="p-5 border border-brand-cream-2 rounded-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="w-11 h-11 rounded-2xl flex-shrink-0" />
      </div>
    </Card>
  );
}

export function StatusCardSkeleton() {
  return (
    <Card className="p-4 md:p-5 border border-brand-cream-2 rounded-2xl">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex-shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </Card>
  );
}

export function ChartSkeleton({ rows = 4 }) {
  return (
    <Card className="p-5 md:p-6 border border-brand-cream-2 rounded-2xl">
      <Skeleton className="h-5 w-40 mb-5" />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <Card className="p-5 md:p-6 border border-brand-cream-2 rounded-2xl">
      <Skeleton className="h-5 w-40 mb-5" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </Card>
  );
}

