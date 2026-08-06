import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import RatingStars from '../components/ui/RatingStars';
import ReviewModal from '../components/domain/ReviewModal';
import { CartContext } from '../context/CartContext';
import { paymentLabel } from '../lib/payment';
import { useReorder } from '../hooks/useReorder';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { useReviews } from '../hooks/useReviews';

function formatDate(dateStr) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateStr));
}

function formatOrderDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (checkDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (checkDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}

function formatTime(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateStr));
}

function formatFullDateTime(dateStr) {
  const day = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
  return `${day} ${formatTime(dateStr)}`;
}

function formatPrice(amount) {
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num);
}

const FoodPlaceholder = () => (
  <div className="w-full h-full bg-gradient-to-br from-brand-cream to-brand-cream-2 flex items-center justify-center">
    <svg className="w-6 h-6 text-brand-pink/30 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  </div>
);

function OrderDetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse max-w-3xl mx-auto">
      {/* Back button skeleton */}
      <div className="w-28 h-5 bg-brand-charcoal/10 rounded-md" />

      {/* Header skeleton */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-cream-2 shadow-warm">
        <div className="w-40 h-4 bg-brand-charcoal/10 rounded-md mb-4" />
        <div className="w-56 h-8 bg-brand-charcoal/10 rounded-lg" />
        <div className="flex flex-wrap gap-3 mt-5">
          <div className="w-24 h-7 bg-brand-charcoal/10 rounded-full" />
          <div className="w-40 h-7 bg-brand-charcoal/10 rounded-md" />
          <div className="w-36 h-7 bg-brand-charcoal/10 rounded-md" />
        </div>
      </div>

      {/* Timeline skeleton */}
      <Card className="p-6">
        <div className="w-36 h-6 bg-brand-charcoal/10 rounded-md mb-6" />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-3 h-3 bg-brand-charcoal/10 rounded-full mt-1" />
              <div className="flex-1 space-y-1">
                <div className="w-24 h-4 bg-brand-charcoal/10 rounded-md" />
                <div className="w-32 h-3 bg-brand-charcoal/10 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Items skeleton */}
      <Card className="p-6">
        <div className="w-36 h-6 bg-brand-charcoal/10 rounded-md mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-brand-charcoal/10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="w-40 h-4 bg-brand-charcoal/10 rounded-md" />
                <div className="w-24 h-3 bg-brand-charcoal/10 rounded-md" />
              </div>
              <div className="w-16 h-5 bg-brand-charcoal/10 rounded-md" />
            </div>
          ))}
        </div>
      </Card>

      {/* Billing skeleton */}
      <Card className="p-6">
        <div className="w-24 h-5 bg-brand-charcoal/10 rounded-md mb-4" />
        <div className="space-y-3">
          <div className="flex justify-between"><div className="w-16 h-4 bg-brand-charcoal/10 rounded" /><div className="w-12 h-4 bg-brand-charcoal/10 rounded" /></div>
          <div className="flex justify-between"><div className="w-20 h-4 bg-brand-charcoal/10 rounded" /><div className="w-12 h-4 bg-brand-charcoal/10 rounded" /></div>
          <div className="flex justify-between"><div className="w-12 h-4 bg-brand-charcoal/10 rounded" /><div className="w-12 h-4 bg-brand-charcoal/10 rounded" /></div>
          <div className="border-t border-brand-charcoal/5 pt-3 flex justify-between"><div className="w-16 h-5 bg-brand-charcoal/10 rounded" /><div className="w-16 h-5 bg-brand-charcoal/10 rounded" /></div>
        </div>
      </Card>

      {/* Actions skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-12 bg-brand-charcoal/10 rounded-full" />
        <div className="flex-1 h-12 bg-brand-charcoal/10 rounded-full" />
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [menuItemsMap, setMenuItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reorderMsg, setReorderMsg] = useState(null);
  const [cancelMsg, setCancelMsg] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);
  const [reviewsByItem, setReviewsByItem] = useState({});
  const [activeReviewItem, setActiveReviewItem] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { reorder, reorderLoading, reorderError } = useReorder(addToCart);
  const { cancelOrder, cancelLoading, cancelError, setCancelError } = useCancelOrder();
  const {
    getMyReview,
    submitReview,
    updateReview,
    submitLoading,
    updateLoading,
    error: reviewError,
    setError: setReviewError,
  } = useReviews();

  // Fetch menu items map for image lookup
  useEffect(() => {
    let cancelled = false;
    const fetchMenu = async () => {
      try {
        const res = await api.get('/menu', { params: { limit: 50 } });
        if (res.data?.data?.items && !cancelled) {
          const map = {};
          res.data.data.items.forEach(item => {
            map[item._id] = item;
          });
          setMenuItemsMap(map);
        }
      } catch (err) {
        console.error('Failed to load menu items for images', err);
      }
    };
    fetchMenu();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/orders/' + id);
        if (!cancelled) setOrder(res.data.data.order);
      } catch (err) {
        if (!cancelled) {
          const status = err.response?.status;
          if (status === 404 || status === 403) {
            setError(err.response?.data?.message || 'Order not found.');
          } else {
            setError('Failed to load order details. Please try again.');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOrder();
    return () => { cancelled = true; };
  }, [id]);

  const handleReorder = async () => {
    if (!order) return;
    const result = await reorder(order);
    if (result && result.success) {
      setReorderMsg(result.message);
      setTimeout(() => navigate('/cart'), 1500);
    }
  };

  // Load the user's existing reviews for each item when the order is delivered.
  useEffect(() => {
    if (!order || order.status !== 'delivered') return;
    let cancelled = false;

    const loadMyReviews = async () => {
      const next = {};
      // Load reviews in parallel for all items.
      await Promise.all(
        order.items.map(async (item) => {
          const result = await getMyReview(item.menuItemId);
          if (!cancelled && result.success && result.review) {
            next[item.menuItemId] = result.review;
          }
        })
      );
      if (!cancelled) setReviewsByItem(next);
    };

    loadMyReviews();
    return () => { cancelled = true; };
  }, [order, getMyReview]);

  const handleRateItem = (item) => {
    setReviewError(null);
    setActiveReviewItem(item);
  };

  const handleCloseReviewModal = () => {
    if (submitLoading || updateLoading) return;
    setActiveReviewItem(null);
  };

  const handleSubmitReview = async ({ rating, comment }) => {
    if (!order || !activeReviewItem) return;
    const existing = reviewsByItem[activeReviewItem.menuItemId];

    if (existing) {
      // Edit mode
      const result = await updateReview({
        id: existing._id,
        rating,
        comment,
      });
      if (result && result.success) {
        setReviewsByItem((prev) => ({
          ...prev,
          [activeReviewItem.menuItemId]: result.review,
        }));
        setReviewMsg('Review updated successfully');
        setActiveReviewItem(null);
      }
    } else {
      // New review
      const result = await submitReview({
        menuItemId: activeReviewItem.menuItemId,
        orderId: order._id,
        rating,
        comment,
      });
      if (result && result.success) {
        setReviewsByItem((prev) => ({
          ...prev,
          [activeReviewItem.menuItemId]: result.review,
        }));
        setReviewMsg('Review submitted successfully');
        setActiveReviewItem(null);
      }
    }
  };

  const isCancellable = order?.status === 'pending' || order?.status === 'confirmed';

  const handleCancelClick = () => {
    setCancelError(null);
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    if (cancelLoading) return;
    setShowCancelModal(false);
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    const result = await cancelOrder(order._id);
    if (result && result.success) {
      // Update order state immediately so the timeline, badge, and buttons refresh.
      setOrder((prev) => (prev ? { ...prev, ...result.order, status: 'cancelled' } : prev));
      setCancelMsg(result.message);
      setShowCancelModal(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <OrderDetailSkeleton />
      </PageContainer>
    );
  }

  if (error || !order) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl shadow-warm border border-brand-cream-2 px-6 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-brand-charcoal mb-2">Order Not Found</h2>
          <p className="text-sm text-brand-charcoal/50 mb-6 max-w-sm">{error || 'The order you are looking for could not be loaded.'}</p>
          <Button onClick={() => navigate('/orders')} className="rounded-full px-8">Back to Orders</Button>
        </div>
      </PageContainer>
    );
  }

  const hasAddress =
    order.addressSnapshot &&
    (order.addressSnapshot.line1 || order.addressSnapshot.city || order.addressSnapshot.state);

  const firstItem = order.items[0];
  const firstItemName = firstItem?.name || 'Order';
  const firstItemQty = firstItem?.quantity || 1;
  const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const statusConfig = {
    pending: {
      label: 'Placed',
      bg: 'bg-amber-50 border border-amber-200/50 text-amber-700',
      dot: 'bg-amber-500',
    },
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-blue-50 border border-blue-200/50 text-blue-700',
      dot: 'bg-blue-500',
    },
    preparing: {
      label: 'Preparing',
      bg: 'bg-purple-50 border border-purple-200/50 text-purple-700',
      dot: 'bg-purple-500',
    },
    ready: {
      label: 'Out for Delivery',
      bg: 'bg-cyan-50 border border-cyan-200/50 text-cyan-700',
      dot: 'bg-cyan-500',
    },
    delivered: {
      label: 'Delivered',
      bg: 'bg-emerald-50 border border-emerald-200/50 text-emerald-700',
      dot: 'bg-emerald-500',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-brand-charcoal/10 border border-brand-charcoal/15 text-brand-charcoal/80',
      dot: 'bg-brand-charcoal/50',
    },
  };

  const statusInfo = statusConfig[order.status] || {
    label: order.status.charAt(0).toUpperCase() + order.status.slice(1),
    bg: 'bg-brand-charcoal/5 border border-brand-charcoal/10 text-brand-charcoal/70',
    dot: 'bg-brand-charcoal/40',
  };

  const sectionHeadingClass =
    'text-xs font-display font-bold text-brand-charcoal uppercase tracking-widest mb-4 pb-2.5 border-b border-brand-charcoal/5 text-brand-charcoal/40';

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-charcoal/50 hover:text-brand-charcoal transition-colors cursor-pointer group"
        >
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Orders
        </button>

        {/* Message Notifications */}
        {reorderMsg && (
          <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-sm px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in" role="alert">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{reorderMsg} (redirecting...)</span>
          </div>
        )}
        {cancelMsg && (
          <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-sm px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in" role="alert">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{cancelMsg}</span>
          </div>
        )}
        {reorderError && (
          <div className="bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in" role="alert">
            <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{reorderError}</span>
          </div>
        )}
        {reviewMsg && (
          <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-sm px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in" role="alert">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{reviewMsg}</span>
          </div>
        )}

        {/* Header */}
        <header className="bg-white p-6 md:p-8 rounded-3xl border border-brand-cream-2 shadow-warm">
          <span className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-widest block mb-3">
            Order Details
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-brand-charcoal leading-tight">
            {firstItemName} <span className="text-brand-pink">×{firstItemQty}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4 text-sm text-brand-charcoal/60">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${statusInfo.bg}`}>
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
            <span className="font-medium">
              {formatOrderDate(order.createdAt)} &bull; {formatTime(order.createdAt)}
            </span>
            <span className="font-bold text-brand-charcoal">
              {totalItems} Item{totalItems !== 1 ? 's' : ''} &bull; <span className="text-brand-pink">{formatPrice(order.total)}</span>
            </span>
          </div>
        </header>

        {/* Order Status Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <Card className="p-6 border border-brand-cream-2 rounded-3xl">
            <h2 className={sectionHeadingClass}>
              Order Status
            </h2>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-charcoal/5">
              {order.statusHistory.map((entry, idx) => {
                const isLatest = idx === order.statusHistory.length - 1;
                const stepStatusInfo = statusConfig[entry.status] || {
                  label: entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
                  dot: 'bg-brand-charcoal/30',
                };
                return (
                  <div key={idx} className="relative flex items-start gap-4 animate-fade-in">
                    {/* Status timeline node indicator */}
                    <span className={`absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-4 ring-offset-0 ${isLatest ? 'ring-brand-pink/20 ' + stepStatusInfo.dot : 'ring-transparent ' + stepStatusInfo.dot}`} />
                    <div>
                      <p className={`text-sm font-semibold ${isLatest ? 'text-brand-pink font-bold' : 'text-brand-charcoal'}`}>
                        {stepStatusInfo.label}
                      </p>
                      <p className="text-xs text-brand-charcoal/40 mt-0.5">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Ordered Items */}
        <Card className="p-6 border border-brand-cream-2 rounded-3xl">
          <h2 className={sectionHeadingClass}>
            Ordered Items ({order.items.length})
          </h2>
          <div className="divide-y divide-brand-charcoal/5">
            {order.items.map((item, idx) => {
              const itemImage = menuItemsMap[item.menuItemId]?.image;
              const itemSubtotal = Number(item.price) * item.quantity;
              return (
                <div key={idx} className="flex gap-4 items-center py-4 first:pt-0 last:pb-0">
                  {/* Image thumbnail */}
                  <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-brand-cream-2 rounded-xl overflow-hidden relative border border-brand-cream-2/40">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full ${itemImage ? 'hidden' : 'flex'} items-center justify-center`}>
                      <FoodPlaceholder />
                    </div>
                  </div>

                  {/* Detail section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-brand-charcoal text-sm md:text-base truncate">
                        {item.name}
                      </h3>
                      <span className="font-bold text-brand-charcoal text-sm md:text-base tabular-nums flex-shrink-0">
                        {formatPrice(itemSubtotal)}
                      </span>
                    </div>

                    {/* Size & Add-ons detail */}
                    <div className="text-xs text-brand-charcoal/50 mt-1 space-y-0.5">
                      <p>
                        Size: <span className="font-medium text-brand-charcoal/80">{item.size?.name || 'Regular'}</span>
                      </p>
                      {item.addOns && item.addOns.length > 0 && (
                        <p className="truncate">
                          Add-ons: <span className="font-medium text-brand-charcoal/80">
                            {item.addOns.map(ao => `${ao.name} (${formatPrice(ao.price)})`).join(', ')}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Quantity & base price row */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-semibold text-brand-charcoal/60 bg-brand-charcoal/5 px-2.5 py-0.5 rounded-md">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-[11px] text-brand-charcoal/40 font-medium">
                        {formatPrice(item.price)} each
                      </span>
                    </div>

                    {/* Review section — only for delivered orders */}
                    {order.status === 'delivered' && (
                      <div className="mt-3 pt-3 border-t border-brand-charcoal/5">
                        {reviewsByItem[item.menuItemId] ? (
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-wider mb-1">
                                Your Review
                              </p>
                              <RatingStars value={reviewsByItem[item.menuItemId].rating} size="w-4 h-4" />
                              {reviewsByItem[item.menuItemId].comment && (
                                <p className="text-xs text-brand-charcoal/60 mt-1 truncate">
                                  {reviewsByItem[item.menuItemId].comment}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => handleRateItem(item)}
                              disabled={submitLoading || updateLoading}
                            >
                              Edit Review
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-brand-pink font-semibold"
                            onClick={() => handleRateItem(item)}
                            disabled={submitLoading || updateLoading}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <RatingStars value={0} size="w-4 h-4" />
                              Rate this item
                            </span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Bill Details */}
        <Card className="p-6 border border-brand-cream-2 rounded-3xl space-y-3.5">
          <h2 className={sectionHeadingClass}>
            Bill Details
          </h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-charcoal/60">Item Subtotal</span>
            <span className="text-brand-charcoal font-semibold tabular-nums">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-charcoal/60">Delivery Fee</span>
            <span className="text-brand-charcoal font-semibold tabular-nums">{formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-charcoal/60">Taxes & Charges</span>
            <span className="text-brand-charcoal font-semibold tabular-nums">{formatPrice(order.tax)}</span>
          </div>
          <div className="border-t border-brand-charcoal/5 pt-3.5 mt-2 flex items-center justify-between">
            <span className="font-display font-extrabold text-brand-charcoal text-base">Grand Total</span>
            <span className="text-xl font-display font-extrabold text-brand-pink tabular-nums">{formatPrice(order.total)}</span>
          </div>
        </Card>

        {/* Delivery Address */}
        <Card className="p-6 border border-brand-cream-2 rounded-3xl">
          <h2 className={sectionHeadingClass}>
            Delivery Address
          </h2>
          {hasAddress ? (
            <div className="text-xs md:text-sm text-brand-charcoal/80 space-y-2 font-medium leading-relaxed">
              {(order.addressSnapshot.fullName || order.addressSnapshot.phone) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {order.addressSnapshot.fullName && (
                    <p className="font-display font-semibold text-brand-charcoal text-sm md:text-base">
                      {order.addressSnapshot.fullName}
                    </p>
                  )}
                  {order.addressSnapshot.phone && (
                    <p className="text-brand-charcoal/60 tabular-nums">{order.addressSnapshot.phone}</p>
                  )}
                </div>
              )}
              <div className="space-y-0.5">
                {order.addressSnapshot.line1 && <p>{order.addressSnapshot.line1}</p>}
                {order.addressSnapshot.line2 && <p>{order.addressSnapshot.line2}</p>}
                {order.addressSnapshot.landmark && (
                  <p className="text-brand-charcoal/50">Landmark: {order.addressSnapshot.landmark}</p>
                )}
                <p>{[order.addressSnapshot.city, order.addressSnapshot.state, order.addressSnapshot.zip].filter(Boolean).join(', ')}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-brand-charcoal/40 italic">No delivery address provided</p>
          )}
        </Card>

        {/* Payment Method */}
        <Card className="p-6 border border-brand-cream-2 rounded-3xl">
          <h2 className={sectionHeadingClass}>
            Payment Method
          </h2>
          <p className="text-sm text-brand-charcoal font-semibold capitalize flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            {paymentLabel(order.paymentMethod)}
          </p>
        </Card>

        {/* Order Information */}
        <Card className="p-6 border border-brand-cream-2 rounded-3xl">
          <h2 className={sectionHeadingClass}>
            Order Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <h3 className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-widest mb-1.5">
                Order ID
              </h3>
              <p className="text-sm md:text-base text-brand-charcoal font-bold tracking-wide tabular-nums">
                {order._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-widest mb-1.5">
                Placed On
              </h3>
              <p className="text-sm md:text-base text-brand-charcoal font-bold tracking-wide tabular-nums">
                {formatFullDateTime(order.createdAt)}
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6 border border-brand-cream-2 rounded-3xl">
          <h2 className={sectionHeadingClass}>
            Actions
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Re-order — always available, even after cancellation */}
            <Button
              className="w-full sm:flex-1 py-3.5 rounded-full font-bold shadow-md hover:shadow-lg hover:bg-brand-pink-dark transition-all flex items-center justify-center gap-2"
              loading={reorderLoading}
              onClick={handleReorder}
            >
              {!reorderLoading && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              )}
              {reorderLoading ? 'Adding to cart...' : 'Re-order this Meal'}
            </Button>

            {/* Cancel Order — only while order is placed/confirmed */}
            {isCancellable && (
              <Button
                className="w-full sm:flex-1 py-3.5 rounded-full font-bold bg-error hover:bg-error/90 transition-all flex items-center justify-center gap-2"
                loading={cancelLoading}
                onClick={handleCancelClick}
                disabled={reorderLoading}
              >
                {!cancelLoading && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        title="Cancel Order"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-brand-charcoal mb-1">
                Cancel this order?
              </h3>
              <p className="text-sm text-brand-charcoal/60">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {cancelError && (
            <div className="bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl flex items-center gap-2" role="alert">
              <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">{cancelError}</span>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1 rounded-full"
              onClick={handleCloseCancelModal}
              disabled={cancelLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1 rounded-full !bg-error hover:!bg-error/90"
              loading={cancelLoading}
              onClick={handleConfirmCancel}
              disabled={!order}
            >
              Yes, Cancel Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal — submit or edit a rating for a delivered item */}
      <ReviewModal
        isOpen={!!activeReviewItem}
        onClose={handleCloseReviewModal}
        title={
          activeReviewItem && reviewsByItem[activeReviewItem.menuItemId]
            ? 'Edit your review'
            : 'Rate this item'
        }
        initialRating={activeReviewItem ? (reviewsByItem[activeReviewItem.menuItemId]?.rating || 0) : 0}
        initialComment={activeReviewItem ? (reviewsByItem[activeReviewItem.menuItemId]?.comment || '') : ''}
        saving={submitLoading || updateLoading}
        error={reviewError}
        onSubmit={handleSubmitReview}
      />
    </PageContainer>
  );
}

