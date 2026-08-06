import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import PageContainer from '../components/layout/PageContainer';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CartContext } from '../context/CartContext';
import { paymentLabel } from '../lib/payment';
import { useReorder } from '../hooks/useReorder';
import { useCancelOrder } from '../hooks/useCancelOrder';

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
    <svg className="w-8 h-8 text-brand-pink/35 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  </div>
);

function OrderCard({ order, onReorder, reorderProcessing, onCancelClick, cancelProcessing, menuItemsMap }) {
  const navigate = useNavigate();
  const firstItem = order.items[0];
  const firstMenuItem = firstItem ? menuItemsMap[firstItem.menuItemId] : null;
  
  const firstItemName = firstMenuItem?.name || firstItem?.name || 'Order Item';
  const firstItemImage = firstMenuItem?.image || null;
  
  const remainingItemsCount = order.items.length - 1;
  const cancellable = order.status === 'pending' || order.status === 'confirmed';

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

  return (
    <div className="bg-white rounded-2xl shadow-warm border border-brand-cream-2 hover:shadow-warm-lg transition-all duration-300 overflow-hidden group flex flex-col justify-between h-full">
      {/* Header & Body Section */}
      <div 
        onClick={() => navigate('/orders/' + order._id)}
        className="p-5 cursor-pointer hover:bg-brand-cream/10 transition-colors flex-1"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-sm md:text-base font-display font-bold text-brand-charcoal tracking-wide truncate flex-1 pr-2">
            {firstItemName} <span className="text-brand-charcoal/40 text-xs font-bold font-body ml-1.5">× {firstItem?.quantity || 1}</span>
          </h3>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} flex-shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-brand-cream-2 rounded-xl overflow-hidden relative shadow-sm border border-brand-cream-2/40">
            {firstItemImage ? (
              <img
                src={firstItemImage}
                alt={firstItemName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full ${firstItemImage ? 'hidden' : 'flex'} items-center justify-center`}>
              <FoodPlaceholder />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div className="space-y-1">
              {/* If more items exist, show: +N more items */}
              {remainingItemsCount > 0 ? (
                <p className="text-xs font-semibold text-brand-pink">
                  +{remainingItemsCount} more item{remainingItemsCount > 1 ? 's' : ''}
                </p>
              ) : (
                <div className="h-4" />
              )}
              
              {/* Small secondary Order ID text below food summary */}
              <p className="text-xs text-brand-charcoal/40 font-medium mt-1">
                Order #{order._id.slice(-8).toUpperCase()}
              </p>
              {/* Payment method */}
              <p className="text-[11px] text-brand-charcoal/35 font-medium mt-1 inline-flex items-center gap-1">
                <svg className="w-3 h-3 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {paymentLabel(order.paymentMethod)}
              </p>
            </div>

            <div className="flex items-baseline justify-between mt-auto pt-2">
              <span className="text-xs font-medium text-brand-charcoal/50">
                {formatOrderDate(order.createdAt)}
              </span>
              <span className="text-base font-display font-extrabold text-brand-pink tabular-nums">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons Footer */}
      <div className="px-5 pb-5 pt-3 bg-brand-cream/10 border-t border-brand-cream-2/30 flex flex-wrap gap-3 mt-auto">
        <button
          onClick={() => navigate('/orders/' + order._id)}
          className="flex-1 flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold border border-brand-charcoal/10 text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-all min-h-[40px] cursor-pointer"
        >
          View Details
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onReorder(order); }}
          disabled={reorderProcessing}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all min-h-[40px] bg-brand-pink text-white hover:bg-brand-pink-dark hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {reorderProcessing ? (
            <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          )}
          {reorderProcessing ? 'Adding...' : 'Re-order'}
        </button>
        {cancellable && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCancelClick(order); }}
            disabled={cancelProcessing}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all min-h-[40px] bg-error text-white hover:bg-error/90 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {cancelProcessing ? (
              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {cancelProcessing ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-warm border border-brand-cream-2 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 flex-1 rounded-full" />
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [menuItemsMap, setMenuItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reorderMsg, setReorderMsg] = useState(null);
  const [cancelMsg, setCancelMsg] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { reorder, reorderLoading, reorderError } = useReorder(addToCart);
  const { cancelOrder, cancelLoading, cancelError, setCancelError } = useCancelOrder();

  // Fetch menu items to map images
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
        // Silently ignore — the order cards render without item images.
      }
    };
    fetchMenu();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/orders');
        if (!cancelled) setOrders(res.data.data.orders);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOrders();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const handleReorder = async (order) => {
    const result = await reorder(order);
    if (result && result.success) {
      setReorderMsg(result.message);
      setTimeout(() => setReorderMsg(null), 4000);
    }
  };

  const handleCancelClick = (order) => {
    setCancelError(null);
    setOrderToCancel(order);
  };

  const handleCloseCancelModal = () => {
    if (cancelLoading) return;
    setOrderToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    const result = await cancelOrder(orderToCancel._id);
    if (result && result.success) {
      // Update status badge immediately and remove the Cancel button.
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === orderToCancel._id ? { ...o, ...result.order, status: 'cancelled' } : o
        )
      );
      setCancelMsg(result.message);
      setTimeout(() => setCancelMsg(null), 4000);
      setOrderToCancel(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageContainer>
        <h1 className="text-3xl font-display font-bold text-brand-charcoal mb-8 text-center md:text-left">Orders</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl shadow-warm border border-brand-cream-2 px-6 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-brand-pink/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-brand-charcoal mb-2">Sign in to view orders</h2>
          <p className="text-brand-charcoal/60 mb-6 max-w-sm">Please log in to your account to view your past purchases and track current orders.</p>
          <Link to="/login" className="inline-flex items-center justify-center px-8 py-3 bg-brand-pink text-white rounded-full font-semibold text-sm hover:bg-brand-pink-dark hover:shadow-lg transition-all min-h-[44px]">Sign In</Link>
        </div>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <h1 className="text-3xl font-display font-bold text-brand-charcoal mb-8 text-center md:text-left">Orders</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <h1 className="text-3xl font-display font-bold text-brand-charcoal mb-8 text-center md:text-left">Orders</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl shadow-warm border border-brand-cream-2 px-6 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-brand-charcoal mb-2">Something went wrong</h2>
          <p className="text-sm text-brand-charcoal/50 mb-6 max-w-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="inline-flex items-center justify-center px-8 py-3 bg-brand-pink text-white rounded-full font-semibold text-sm hover:bg-brand-pink-dark hover:shadow-lg transition-all min-h-[44px] cursor-pointer">Try Again</button>
        </div>
      </PageContainer>
    );
  }

  if (orders.length === 0) {
    return (
      <PageContainer>
        <h1 className="text-3xl font-display font-bold text-brand-charcoal mb-8 text-center md:text-left">Orders</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl shadow-warm border border-brand-cream-2 px-6 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-brand-charcoal/5 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-brand-charcoal mb-2">No orders yet</h2>
          <p className="text-sm text-brand-charcoal/50 mb-6 max-w-sm">Place your first delicious order to track it and see its summary here.</p>
          <Link to="/" className="inline-flex items-center justify-center px-8 py-3 bg-brand-pink text-white rounded-full font-semibold text-sm hover:bg-brand-pink-dark hover:shadow-lg transition-all min-h-[44px]">Browse Menu</Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-display font-bold text-brand-charcoal">Orders</h1>
        <span className="text-sm font-medium text-brand-charcoal/50">
          Showing {orders.length} past order{orders.length > 1 ? 's' : ''}
        </span>
      </div>

      {reorderMsg && (
        <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-sm px-4 py-3 rounded-2xl mb-6 flex items-center gap-2 animate-fade-in" role="alert">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{reorderMsg}</span>
        </div>
      )}
      {cancelMsg && (
        <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-sm px-4 py-3 rounded-2xl mb-6 flex items-center gap-2 animate-fade-in" role="alert">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{cancelMsg}</span>
        </div>
      )}
      {reorderError && (
        <div className="bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl mb-6 flex items-center gap-2 animate-fade-in" role="alert">
          <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">{reorderError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.map((order) => (
          <OrderCard 
            key={order._id} 
            order={order} 
            onReorder={handleReorder} 
            reorderProcessing={reorderLoading} 
            onCancelClick={handleCancelClick}
            cancelProcessing={cancelLoading}
            menuItemsMap={menuItemsMap}
          />
        ))}
      </div>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={!!orderToCancel}
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
              disabled={!orderToCancel}
            >
              Yes, Cancel Order
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}


