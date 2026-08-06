import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import RatingStars from '../ui/RatingStars';

/**
 * Modal for submitting or editing a rating & review.
 *
 * Props:
 *  - isOpen, onClose
 *  - title (string) — modal heading (e.g. "Rate this item")
 *  - initialRating, initialComment — pre-fill for edit mode
 *  - saving (boolean) — disables the form while saving
 *  - error (string|null) — server error to display
 *  - onSubmit({ rating, comment }) — called with the chosen values
 */
export default function ReviewModal({
  isOpen,
  onClose,
  title = 'Rate this item',
  initialRating = 0,
  initialComment = '',
  saving = false,
  error = null,
  onSubmit,
}) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  // Sync form fields whenever the modal opens with new initial values.
  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setComment(initialComment);
    }
  }, [isOpen, initialRating, initialComment]);

  const canSubmit = rating >= 1 && rating <= 5 && !saving;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        {/* Rating stars */}
        <div className="flex flex-col items-center text-center">
          <span className="text-sm text-brand-charcoal/60 mb-3">Tap a star to rate</span>
          <RatingStars
            value={rating}
            size="w-9 h-9"
            interactive
            onChange={setRating}
            disabled={saving}
          />
          <span className="mt-2 text-sm font-semibold text-brand-charcoal">
            {rating >= 1 ? `${rating} out of 5` : 'Select a rating'}
          </span>
        </div>

        {/* Comment textarea */}
        <div>
          <label
            htmlFor="review-comment"
            className="block text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-widest mb-1.5"
          >
            Comment (optional)
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Share your experience with this item..."
            disabled={saving}
            className="w-full px-4 py-3 rounded-2xl border border-brand-charcoal/10 bg-white text-sm text-brand-charcoal placeholder:text-brand-charcoal/30 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink/40 resize-none disabled:opacity-60"
          />
          <p className="text-right text-[11px] text-brand-charcoal/30 mt-1 tabular-nums">
            {comment.length}/500
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl flex items-center gap-2" role="alert">
            <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            className="flex-1 rounded-full"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1 rounded-full"
            loading={saving}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {saving ? 'Saving...' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

