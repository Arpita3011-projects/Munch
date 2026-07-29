import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';

/**
 * Format a date string into a human-readable form.
 */
function formatDate(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

/**
 * Format price in USD.
 */
function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
}

/**
 * Map an order status to a Badge variant.
 */
function statusVariant(status) {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'default';
    case 'preparing':
      return 'pink';
    case 'ready':
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Format a status string for display (e.g. "pending" → "Pending").
 */
function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Timeline */}
      <Card>
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Items */}
      <Card>
        <Skeleton className="h-5 w-20 mb-4" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-start justify-between mb-3">
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </Card>

      {/* Pricing */}
      <Card>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-4 w-24" />
        </Card>
        <Card>
          <Skeleton className="h-5 w-36 mb-3" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/orders/${id}`);
        if (!cancelled) {
          setOrder(res.data.data.order);
        }
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <OrderDetailSkeleton />
      </PageContainer>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-brand-charcoal/60 mb-1">
            {error || 'Order not found'}
          </p>
          <p className="text-sm text-brand-charcoal/40 mb-6">
            The order you are looking for could not be loaded.
          </p>
          <Button onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </PageContainer>
    );
  }

  const hasAddress =
    order.addressSnapshot &&
    (order.addressSnapshot.line1 ||
      order.addressSnapshot.city ||
      order.addressSnapshot.state);

  return (
    <PageContainer>
      {/* Back button */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-1.5 text-sm text-brand-charcoal/50 hover:text-brand-charcoal transition-colors mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Orders
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-charcoal">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-brand-charcoal/40 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge variant={statusVariant(order.status)}>
          {formatStatus(order.status)}
        </Badge>
      </div>

      {/* Status Timeline */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <Card className="mb-4">
          <h2 className="text-sm font-display font-semibold text-brand-charcoal mb-4">
            Status Timeline
          </h2>
          <div className="space-y-3">
            {order.statusHistory.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    idx === order.statusHistory.length - 1
                      ? 'bg-brand-pink'
                      : 'bg-brand-charcoal/20'
                  }`} />
                  {idx < order.statusHistory.length - 1 && (
                    <div className="w-px flex-1 bg-brand-charcoal/10 min-h-[20px]" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium text-brand-charcoal">
                    {formatStatus(entry.status)}
                  </p>
                  <p className="text-xs text-brand-charcoal/40">
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Items */}
      <Card className="mb-4">
        <h2 className="text-sm font-display font-semibold text-brand-charcoal mb-4">
          Items ({order.items.length})
        </h2>
        <div className="space-y-3">
          {order.items.map((item, idx) => {
            const itemSubtotal = Number(item.price) * item.quantity;
            return (
              <div key={idx} className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brand-charcoal">
                    <span className="font-medium">{item.quantity}x</span> {item.name}
                  </p>
                  <p className="text-xs text-brand-charcoal/40 mt-0.5">
                    {item.size?.name || 'Regular'}
                    {item.addOns && item.addOns.length > 0 && (
                      <> — {item.addOns.map((ao) => ao.name).join(', ')}</>
                    )}
                  </p>
                </div>
                <span className="text-sm text-brand-charcoal tabular-nums flex-shrink-0">
                  {formatPrice(itemSubtotal)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pricing Breakdown */}
      <Card className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-charcoal/60">Subtotal</span>
          <span className="text-brand-charcoal tabular-nums">
            {formatPrice(order.subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-charcoal/60">Delivery Fee</span>
          <span className="text-brand-charcoal tabular-nums">
            {formatPrice(order.deliveryFee)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-charcoal/60">Tax</span>
          <span className="text-brand-charcoal tabular-nums">
            {formatPrice(order.tax)}
          </span>
        </div>
        <div className="border-t border-brand-charcoal/5 pt-2 mt-2 flex items-center justify-between">
          <span className="font-display font-semibold text-brand-charcoal">Total</span>
          <span className="text-xl font-display font-bold text-brand-pink tabular-nums">
            {formatPrice(order.total)}
          </span>
        </div>
      </Card>

      {/* Payment Method & Delivery Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h2 className="text-sm font-display font-semibold text-brand-charcoal mb-3">
            Payment Method
          </h2>
          <p className="text-sm text-brand-charcoal capitalize">
            {order.paymentMethod === 'mock'
              ? 'Mock Payment'
              : order.paymentMethod === 'card'
              ? 'Credit / Debit Card'
              : 'Cash'}
          </p>
        </Card>

        <Card>
          <h2 className="text-sm font-display font-semibold text-brand-charcoal mb-3">
            Delivery Address
          </h2>
          {hasAddress ? (
            <div className="text-sm text-brand-charcoal">
              {order.addressSnapshot.line1 && (
                <p>{order.addressSnapshot.line1}</p>
              )}
              {order.addressSnapshot.line2 && (
                <p>{order.addressSnapshot.line2}</p>
              )}
              <p>
                {[order.addressSnapshot.city, order.addressSnapshot.state, order.addressSnapshot.zip]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-brand-charcoal/40">No address provided</p>
          )}
        </Card>
      </div>

      {/* Footer date */}
      <p className="text-xs text-center text-brand-charcoal/30 pb-safe">
        Order created on {formatDate(order.createdAt)}
      </p>
    </PageContainer>
  );
}

