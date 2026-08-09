import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/axios';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';
import RatingStars from '../ui/RatingStars';
import { Modal } from '../ui/Modal';
import ReviewModal from './ReviewModal';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../hooks/useAuth';

function formatReviewDate(dateStr) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function ReviewCard({ review, isMine = false, onEdit, onDelete, processing }) {
  const userName = review.user?.name || 'Anonymous';
  return (
    <div className="py-4 first:pt-0 last:pb-0 border-b border-brand-charcoal/5 last:border-b-0">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-semibold text-brand-charcoal truncate">{userName}</p>
          {isMine && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-pink/10 text-brand-pink flex-shrink-0">
              Your review
            </span>
          )}
        </div>
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
      {isMine && (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={onEdit}
            disabled={processing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-brand-charcoal/10 text-brand-charcoal/60 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={processing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-error/20 text-error hover:bg-error/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Displays the aggregate rating summary + list of reviews for a menu item,
 * and reflects the business rule that only customers who ordered an item
 * may submit a review.
 *
 * Scenarios:
 *  - Never ordered / not signed in: existing reviews only. If none, show an
 *    informational empty state (no Write Review button, no form).
 *  - Ordered (delivered) but not reviewed: show Write Review button + modal.
 *  - Already reviewed: show their review inline with Edit/Delete.
 *
 * The user's delivered orders are fetched once on mount (when signed in) and
 * reused for the eligibility check — we never refetch them per render.
 */
export default function ReviewsSection({ menuItemId }) {
  const { isAuthenticated } = useAuth();
  const {
    menuLoading,
    getMenuReviews,
    getMyReview,
    submitReview,
    updateReview,
    deleteReview,
    submitLoading,
    updateLoading,
    deleteLoading,
  } = useReviews();

  // Public review list + summary.
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // User-specific state.
  const [myReview, setMyReview] = useState(null);
  const [deliveredOrder, setDeliveredOrder] = useState(null); // delivered order containing this item
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  // Modal state.
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load the public reviews for this item.
  useEffect(() => {
    let cancelled = false;
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

  // Load the authenticated user's review for this item.
  useEffect(() => {
    if (!isAuthenticated) {
      setMyReview(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const result = await getMyReview(menuItemId);
      if (cancelled) return;
      if (result.success) {
        setMyReview(result.review);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, menuItemId, getMyReview]);

  // Fetch the user's orders ONCE (signed-in only) and keep the delivered order
  // that contains this item. Reused across re-renders — no refetch per render.
  useEffect(() => {
    if (!isAuthenticated) {
      setDeliveredOrder(null);
      return;
    }
    let cancelled = false;
    setEligibilityLoading(true);
    const load = async () => {
      try {
        const res = await api.get('/orders');
        if (cancelled) return;
        const orders = res.data?.data?.orders || [];
        const found = orders.find(
          (order) =>
            order.status === 'delivered' &&
            (order.items || []).some(
              (item) => String(item.menuItemId) === String(menuItemId)
            )
        );
        setDeliveredOrder(found || null);
      } catch (err) {
        // If for any reason we can't load orders, fall back to not eligible.
        if (!cancelled) setDeliveredOrder(null);
      } finally {
        if (!cancelled) setEligibilityLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, menuItemId]);

  const canReview = isAuthenticated && !!deliveredOrder && !myReview;

  const refreshReviews = useCallback(async () => {
    const result = await getMenuReviews(menuItemId);
    if (result.success) {
      setData(result.data);
      setError(null);
    }
  }, [getMenuReviews, menuItemId]);

  const openWrite = () => {
    setEditing(false);
    setModalError(null);
    setModalOpen(true);
  };

  const openEdit = () => {
    setEditing(true);
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitLoading || updateLoading) return;
    setModalOpen(false);
    setEditing(false);
    setModalError(null);
  };

  const handleSubmit = async ({ rating, comment }) => {
    setModalError(null);
    let result;
    if (editing && myReview) {
      result = await updateReview({ id: myReview._id, rating, comment });
    } else {
      if (!deliveredOrder) {
        setModalError('You can only review items from a delivered order.');
        return;
      }
      result = await submitReview({
        menuItemId,
        orderId: deliveredOrder._id,
        rating,
        comment,
      });
    }

    if (result && result.success) {
      setModalOpen(false);
      setEditing(false);
      // Refresh the user's review and the public list.
      const my = await getMyReview(menuItemId);
      if (my.success) setMyReview(my.review);
      refreshReviews();
    } else if (result) {
      setModalError(result.message || 'Failed to save your review. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const result = await deleteReview(confirmDelete._id);
    if (result && result.success) {
      setConfirmDelete(null);
      setMyReview(null);
      refreshReviews();
    } else {
      setConfirmDelete(null);
    }
  };

  const processing = submitLoading || updateLoading || deleteLoading;

  return (
    <section aria-label="Ratings and reviews">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-display font-semibold text-brand-charcoal">
          Ratings & Reviews
        </h2>
        {canReview && !eligibilityLoading && (
          <button
            type="button"
            onClick={openWrite}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-pink text-white text-xs font-bold hover:bg-brand-pink-dark transition-colors min-h-[40px] cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Write Review
          </button>
        )}
      </div>

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
              <ReviewCard
                key={review._id}
                review={review}
                isMine={!!myReview && myReview._id === review._id}
                processing={processing}
                onEdit={openEdit}
                onDelete={() => setConfirmDelete(myReview)}
              />
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-5 text-center">
          <p className="text-sm font-medium text-brand-charcoal mb-1">No reviews yet.</p>
          <p className="text-sm text-brand-charcoal/50">
            Reviews can only be submitted by customers who have ordered this item.
          </p>
        </Card>
      )}

      {/* Write / Edit review modal */}
      <ReviewModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit your review' : 'Rate this item'}
        initialRating={editing && myReview ? myReview.rating : 0}
        initialComment={editing && myReview ? myReview.comment || '' : ''}
        saving={processing}
        error={modalError}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete your review?"
      >
        <div className="space-y-5">
          <p className="text-sm text-brand-charcoal/70">
            This will permanently remove your rating and review for this item.
          </p>
          {confirmDelete && (
            <div className="bg-brand-cream-2/40 rounded-2xl p-4">
              <RatingStars value={confirmDelete.rating} size="w-4 h-4" className="mb-2" />
              {confirmDelete.comment ? (
                <p className="text-sm text-brand-charcoal/70 leading-relaxed">{confirmDelete.comment}</p>
              ) : (
                <p className="text-sm text-brand-charcoal/30 italic">No comment provided.</p>
              )}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 py-3 rounded-full text-sm font-semibold"
              onClick={() => setConfirmDelete(null)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="flex-1 py-3 rounded-full text-sm font-semibold bg-error hover:bg-error/90"
              loading={deleteLoading}
              onClick={handleDelete}
              disabled={processing}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
