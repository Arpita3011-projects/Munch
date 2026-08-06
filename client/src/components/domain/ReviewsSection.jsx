import { useEffect, useState } from 'react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import RatingStars from '../ui/RatingStars';
import { useReviews } from '../../hooks/useReviews';

function formatReviewDate(dateStr) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function ReviewCard({ review }) {
  const userName = review.user?.name || 'Anonymous';
  return (
    <div className="py-4 first:pt-0 last:pb-0 border-b border-brand-charcoal/5 last:border-b-0">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <p className="text-sm font-semibold text-brand-charcoal truncate">{userName}</p>
        <span className="text-xs text-brand-charcoal/40 flex-shrink-0">
          {formatReviewDate(review.createdAt)}
        </span>
      </div>
      <RatingStars value={review.rating} size="w-4 h-4" className="mb-2" />
      {review.comment ? (
        <p className="text-sm text-brand-charcoal/70 leading-relaxed">{review.comment}</p>
      ) : (
        <p className="text-sm text-brand-charcoal/30 italic">No comment provided.</p>
      )}
    </div>
  );
}

/**
 * Displays the aggregate rating summary + list of reviews for a menu item.
 * Reviews are shown newest first (server returns them pre-sorted).
 */
export default function ReviewsSection({ menuItemId }) {
  const { menuLoading, getMenuReviews } = useReviews();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // Reset so we never show another item's reviews while the new ones load.
    setData(null);
    setError(null);
    const load = async () => {
      const result = await getMenuReviews(menuItemId);
      if (cancelled) return;
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.message);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [menuItemId, getMenuReviews]);

  return (
    <section aria-label="Ratings and reviews">
      <h2 className="text-sm font-display font-semibold text-brand-charcoal mb-3">
        Ratings & Reviews
      </h2>

      {menuLoading && !data ? (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-20" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </Card>
      ) : error ? (
        <Card className="p-5">
          <p className="text-sm text-brand-charcoal/50">{error}</p>
        </Card>
      ) : data && data.count > 0 ? (
        <Card className="p-5">
          {/* Summary */}
          <div className="flex items-center gap-4 pb-4 border-b border-brand-charcoal/5">
            <span className="text-4xl font-display font-extrabold text-brand-charcoal tabular-nums">
              {data.average.toFixed(1)}
            </span>
            <div>
              <RatingStars value={data.average} size="w-5 h-5" />
              <p className="text-xs text-brand-charcoal/50 mt-1">
                {data.count} review{data.count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Review list */}
          <div className="divide-y divide-brand-charcoal/5 mt-2">
            {data.reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-5">
          <p className="text-sm text-brand-charcoal/40">
            No reviews yet. Be the first to rate this item!
          </p>
        </Card>
      )}
    </section>
  );
}

