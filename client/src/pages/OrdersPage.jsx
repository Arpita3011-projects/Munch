import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import PageContainer from '../components/layout/PageContainer';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

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

function OrderCard({ order }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/orders/${order._id}`)}
      className="w-full text-left bg-white rounded-2xl shadow-warm p-4 hover:shadow-warm-lg transition-shadow animate-fade-in cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-display font-semibold text-brand-charcoal">
            #{order._id.slice(-8).toUpperCase()}
          </p>
          <p className="text-xs text-brand-charcoal/40 mt-0.5">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge variant={statusVariant(order.status)}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-brand-charcoal/60">
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </span>
        <span className="text-base font-display font-bold text-brand-pink tabular-nums">
          {formatPrice(order.total)}
        </span>
      </div>
    </button>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-warm p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        if (!cancelled) {
          setOrders(res.data.data.orders);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || 'Failed to load orders. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Orders</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <p className="text-brand-charcoal/60 mb-4">Sign in to view your orders</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors min-h-[44px]"
          >
            Sign In
          </Link>
        </div>
      </PageContainer>
    );
  }

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Orders</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Orders</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-brand-charcoal/60 mb-1">Something went wrong</p>
          <p className="text-sm text-brand-charcoal/40 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors min-h-[44px]"
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Orders</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-charcoal/5 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <p className="text-brand-charcoal/60 mb-1">No orders yet</p>
          <p className="text-sm text-brand-charcoal/40 mb-4">Place your first order to see it here</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors min-h-[44px]"
          >
            Browse Menu
          </Link>
        </div>
      </PageContainer>
    );
  }

  // Orders list
  return (
    <PageContainer>
      <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </PageContainer>
  );
}

