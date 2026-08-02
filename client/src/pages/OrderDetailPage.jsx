import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CartContext } from '../context/CartContext';
import { useReorder } from '../hooks/useReorder';

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
    <div className="space-y-6 animate-pulse max-w-6xl mx-auto">
      {/* Back button skeleton */}
      <div className="w-28 h-5 bg-brand-charcoal/10 rounded-md" />

      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="w-48 h-8 bg-brand-charcoal/10 rounded-lg" />
          <div className="w-32 h-4 bg-brand-charcoal/10 rounded-md" />
        </div>
        <div className="w-24 h-8 bg-brand-charcoal/10 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main skeleton */}
        <div className="lg:col-span-2 space-y-6">
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

          <Card className="p-6">
            <div className="w-28 h-6 bg-brand-charcoal/10 rounded-md mb-6" />
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
        </div>

        {/* Right sidebar skeleton */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="w-24 h-5 bg-brand-charcoal/10 rounded-md mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between"><div className="w-16 h-4 bg-brand-charcoal/10 rounded" /><div className="w-12 h-4 bg-brand-charcoal/10 rounded" /></div>
              <div className="flex justify-between"><div className="w-20 h-4 bg-brand-charcoal/10 rounded" /><div className="w-12 h-4 bg-brand-charcoal/10 rounded" /></div>
              <div className="flex justify-between"><div className="w-12 h-4 bg-brand-charcoal/10 rounded" /><div className="w-12 h-4 bg-brand-charcoal/10 rounded" /></div>
              <div className="border-t border-brand-charcoal/5 pt-3 flex justify-between"><div className="w-16 h-5 bg-brand-charcoal/10 rounded" /><div className="w-16 h-5 bg-brand-charcoal/10 rounded" /></div>
            </div>
          </Card>
          <div className="w-full h-11 bg-brand-charcoal/10 rounded-full" />
        </div>
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
  const { addToCart } = useContext(CartContext);
  const { reorder, reorderLoading, reorderError } = useReorder(addToCart);

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
      bg: 'bg-rose-50 border border-rose-200/50 text-rose-700',
      dot: 'bg-rose-500',
    },
  };

  const statusInfo = statusConfig[order.status] || {
    label: order.status.charAt(0).toUpperCase() + order.status.slice(1),
    bg: 'bg-brand-charcoal/5 border border-brand-charcoal/10 text-brand-charcoal/70',
    dot: 'bg-brand-charcoal/40',
  };

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto space-y-6">
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
        {reorderError && (
          <div className="bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in" role="alert">
            <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{reorderError}</span>
          </div>
        )}

        {/* Main Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-cream-2 shadow-warm">
          <div>
            <span className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-widest block">
              Order Details
            </span>
            <h1 className="text-xl md:text-2xl font-display font-extrabold text-brand-charcoal mt-1">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs md:text-sm text-brand-charcoal/50 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <span className={`self-start md:self-center inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${statusInfo.bg}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>

        {/* Desktop 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Items and status history timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Items List Card */}
            <Card className="p-6 border border-brand-cream-2 rounded-3xl">
              <h2 className="text-base font-display font-bold text-brand-charcoal mb-4 pb-2 border-b border-brand-charcoal/5">
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Status Timeline Card */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <Card className="p-6 border border-brand-cream-2 rounded-3xl">
                <h2 className="text-base font-display font-bold text-brand-charcoal mb-5 pb-2 border-b border-brand-charcoal/5">
                  Order Status History
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
          </div>

          {/* Right Column: Billing summary, address, and re-order button */}
          <div className="space-y-6">
            
            {/* Re-order CTA button */}
            {order.status !== 'cancelled' && (
              <Button
                className="w-full py-3.5 rounded-full font-bold shadow-md hover:shadow-lg hover:bg-brand-pink-dark transition-all flex items-center justify-center gap-2"
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
            )}

            {/* Bill Details Summary Card */}
            <Card className="p-6 border border-brand-cream-2 rounded-3xl space-y-3.5">
              <h2 className="text-sm font-display font-bold text-brand-charcoal uppercase tracking-wider mb-2 text-brand-charcoal/40">
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

            {/* Payment & Delivery address Details */}
            <Card className="p-6 border border-brand-cream-2 rounded-3xl space-y-4">
              <div>
                <h3 className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-widest mb-1.5">
                  Payment Method
                </h3>
                <p className="text-sm text-brand-charcoal font-semibold capitalize flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-brand-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {order.paymentMethod === 'mock' ? 'Mock Payment' : order.paymentMethod === 'card' ? 'Credit / Debit Card' : 'Cash on Delivery'}
                </p>
              </div>

              <div className="border-t border-brand-charcoal/5 pt-4">
                <h3 className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-widest mb-1.5">
                  Delivery Address
                </h3>
                {hasAddress ? (
                  <div className="text-xs md:text-sm text-brand-charcoal/80 space-y-0.5 font-medium leading-relaxed">
                    {order.addressSnapshot.line1 && <p>{order.addressSnapshot.line1}</p>}
                    {order.addressSnapshot.line2 && <p>{order.addressSnapshot.line2}</p>}
                    <p>{[order.addressSnapshot.city, order.addressSnapshot.state, order.addressSnapshot.zip].filter(Boolean).join(', ')}</p>
                  </div>
                ) : (
                  <p className="text-sm text-brand-charcoal/40 italic">No delivery address provided</p>
                )}
              </div>
            </Card>
          </div>

        </div>

        {/* Footer Info */}
        <p className="text-[11px] text-center text-brand-charcoal/30 pb-safe pt-4">
          Order created on {formatDate(order.createdAt)} &bull; Reference ID: {order._id}
        </p>
      </div>
    </PageContainer>
  );
}



