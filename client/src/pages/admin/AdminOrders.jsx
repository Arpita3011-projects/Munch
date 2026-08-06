import { useEffect, useMemo, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { paymentLabel } from '../../lib/payment';



const statusLabels = {
  pending: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200/50',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200/50',
  preparing: 'bg-purple-50 text-purple-700 border-purple-200/50',
  ready: 'bg-cyan-50 text-cyan-700 border-cyan-200/50',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200/50',
};

const statusDots = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-purple-500',
  ready: 'bg-cyan-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-rose-500',
};

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

function formatPlacedTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const check = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const day =
    check.getTime() === today.getTime()
      ? 'Today'
      : check.getTime() === yesterday.getTime()
      ? 'Yesterday'
      : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `${day} • ${time}`;
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

function StatusBadge({ status }) {
  const style = statusStyles[status] || 'bg-brand-charcoal/5 text-brand-charcoal/60 border-brand-charcoal/10';
  const dot = statusDots[status] || 'bg-brand-charcoal/40';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {statusLabels[status] || status}
    </span>
  );
}

function OrderCard({ order, updating, onAdvance, onRequestConfirm, onClose }) {
  const nextStatusLabel = order.nextStatus ? statusLabels[order.nextStatus] : null;
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);

  const handleAdvanceClick = () => {
    setConfirming(true);
    setConfirmError(null);
    onRequestConfirm(order);
  };

  const handleClose = () => {
    setConfirming(false);
    setConfirmError(null);
    onClose();
  };

  const handleConfirm = async () => {
    const result = await onAdvance(order);
    if (result && !result.success) {
      setConfirmError(result.message);
    } else {
      setConfirming(false);
      setConfirmError(null);
    }
  };

  const itemSummary = order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ');

  return (
    <Card className="p-5 border border-brand-cream-2 rounded-2xl flex flex-col gap-4 h-full">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display font-bold text-brand-charcoal text-base truncate">
            #{order._id.slice(-8).toUpperCase()}
          </p>
          <p className="text-xs text-brand-charcoal/40 mt-0.5">
            {formatPlacedTime(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-brand-cream-2 flex items-center justify-center text-brand-pink font-display font-bold text-sm flex-shrink-0">
          {(order.customer?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-charcoal truncate">
            {order.customer?.name || 'Unknown customer'}
          </p>
          <p className="text-xs text-brand-charcoal/40 truncate">{order.customer?.email || ''}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-brand-cream/60 rounded-xl p-3">
        <p className="text-xs text-brand-charcoal/50 mb-1 font-medium">
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm text-brand-charcoal/80 line-clamp-2 leading-snug">{itemSummary}</p>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-brand-charcoal/60">Total</span>
        <span className="text-lg font-display font-extrabold text-brand-charcoal tabular-nums">
          {formatPrice(order.total)}
        </span>
      </div>

      {/* Payment method */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-brand-charcoal/40 font-medium">Payment</span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-brand-charcoal/70">
          <svg className="w-3.5 h-3.5 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          {paymentLabel(order.paymentMethod)}
        </span>
      </div>

      {/* Footer: update status */}
      <div className="mt-auto pt-1">
        {confirming ? (
          <div className="space-y-2">
            {confirmError && (
              <p className="text-xs font-medium text-rose-600">{confirmError}</p>
            )}
            <div className="flex gap-2">
              <Button
                className="flex-1 py-2.5 rounded-full text-sm font-semibold"
                variant="outline"
                onClick={handleClose}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 py-2.5 rounded-full text-sm font-semibold"
                loading={updating}
                onClick={handleConfirm}
              >
                {nextStatusLabel ? `Move to ${nextStatusLabel}` : 'Confirm'}
              </Button>
            </div>
            <p className="text-[11px] text-brand-charcoal/40 text-center">
              {order.status === 'ready'
                ? 'This marks the order as Delivered.'
                : `Advance this order to "${nextStatusLabel || 'next status'}".`}
            </p>
          </div>
        ) : order.canAdvance && order.nextStatus ? (
          <Button
            className="w-full py-2.5 rounded-full text-sm font-semibold"
            onClick={handleAdvanceClick}
            disabled={updating}
          >
            Update Status
          </Button>
        ) : (
          <p className="text-xs font-medium text-brand-charcoal/40 text-center py-2">
            {order.status === 'cancelled' ? 'Order cancelled' : 'Order completed'}
          </p>
        )}
      </div>
    </Card>
  );
}

function OrderCardSkeleton() {
  return (
    <Card className="p-5 border border-brand-cream-2 rounded-2xl space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
    </Card>
  );
}

export default function AdminOrders() {
  const {
    orders,
    loading,
    error,
    updatingId,
    success,
    loadOrders,
    updateOrderStatus,
    clearError,
    clearSuccess,
  } = useAdminOrders();

  const [activeFilter, setActiveFilter] = useState('all');
  const [confirmingOrder, setConfirmingOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    if (activeFilter === 'active') {
      return orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
    }
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  const stats = useMemo(() => {
    const active = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;
    return { total: orders.length, active };
  }, [orders]);

  const handleAdvance = useCallback(
    async (order) => {
      if (!order.nextStatus) return { success: false, message: 'No further status available' };
      const result = await updateOrderStatus(order._id, order.nextStatus);
      if (result?.success) {
        setConfirmingOrder(null);
      }
      return result;
    },
    [updateOrderStatus]
  );

  const handleRequestConfirm = useCallback((order) => {
    setConfirmingOrder(order);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setConfirmingOrder(null);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-brand-charcoal">
          Orders
        </h1>
        <p className="text-sm text-brand-charcoal/50 mt-1">
          {stats.total} total &bull; {stats.active} active
        </p>
      </header>

      {/* Notifications */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-sm px-4 py-3 rounded-2xl flex items-center justify-between gap-3 animate-fade-in" role="alert">
          <span className="font-medium flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </span>
          <button
            type="button"
            onClick={clearSuccess}
            className="text-emerald-700/60 hover:text-emerald-800 transition-colors min-h-[44px] px-2"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl flex items-center justify-between gap-3 animate-fade-in" role="alert">
          <span className="font-medium flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </span>
          <button
            type="button"
            onClick={clearError}
            className="text-rose-700/60 hover:text-rose-800 transition-colors min-h-[44px] px-2"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer min-h-[44px] flex items-center ${
              activeFilter === tab.key
                ? 'bg-brand-charcoal text-white'
                : 'bg-white text-brand-charcoal/60 border border-brand-charcoal/10 hover:text-brand-charcoal hover:border-brand-charcoal/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-cream-2 p-10 text-center">
          <p className="text-sm text-brand-charcoal/40">
            No {activeFilter !== 'all' ? `"${statusLabels[activeFilter] || activeFilter}"` : ''} orders found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              updating={updatingId === order._id}
              onAdvance={handleAdvance}
              onRequestConfirm={handleRequestConfirm}
              onClose={handleCloseConfirm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

