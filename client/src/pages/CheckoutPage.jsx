import { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';

/**
 * Format price in USD.
 */
function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

const DELIVERY_FEE = 3.99;
const TAX_RATE = 0.085;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, clearCart, subtotal } = useContext(CartContext);
  const [paymentMethod, setPaymentMethod] = useState('mock');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);
  const [orderCreated, setOrderCreated] = useState(null);

  // Calculated totals
  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const total = useMemo(() => subtotal + DELIVERY_FEE + tax, [subtotal, tax]);

  const formattedSubtotal = useMemo(() => formatPrice(subtotal), [subtotal]);
  const formattedDeliveryFee = useMemo(() => formatPrice(DELIVERY_FEE), []);
  const formattedTax = useMemo(() => formatPrice(tax), [tax]);
  const formattedTotal = useMemo(() => formatPrice(total), [total]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Checkout</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-brand-charcoal/60 mb-4">Please sign in to continue with checkout.</p>
          <Button onClick={() => navigate('/login', { state: { from: '/checkout' } })}>
            Sign In
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Empty cart
  if (items.length === 0 && !orderCreated) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Checkout</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-brand-charcoal/60 mb-4">Your cart is empty. Add items before checking out.</p>
          <Button onClick={() => navigate('/')}>Browse Menu</Button>
        </div>
      </PageContainer>
    );
  }

  // Success state
  if (orderCreated) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-brand-charcoal mb-2">Order Placed!</h2>
          <p className="text-brand-charcoal/60 mb-1">Order #{orderCreated.slice(-6).toUpperCase()}</p>
          <p className="text-sm text-brand-charcoal/50 mb-6">Your order is being prepared.</p>
          <Button onClick={() => navigate(`/orders/${orderCreated}`)}>
            View Order
          </Button>
        </div>
      </PageContainer>
    );
  }

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError(null);

    try {
      // Build items payload — client sends only identifiers, backend recalculates prices
      const payload = {
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          size: {
            name: item.size?.name || 'Regular',
            priceAdjustment: item.size?.priceAdjustment || 0,
          },
          addOns: (item.addOns || []).map((ao) => ({
            name: ao.name,
            price: ao.price || 0,
          })),
          quantity: item.quantity,
        })),
        paymentMethod,
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip: '',
        },
      };

      const res = await api.post('/orders', payload);
      const order = res.data.data.order;

      // Clear cart and show success
      clearCart();
      setOrderCreated(order._id);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to place order. Please try again.';
      setError(message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageContainer>
      <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Checkout</h1>

      {/* Error */}
      {error && (
        <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-xl mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Order summary */}
      <div className="bg-white rounded-2xl p-4 shadow-warm mb-4">
        <h2 className="text-sm font-display font-semibold text-brand-charcoal mb-3">Order Summary</h2>
        <div className="space-y-3">
          {items.map((item) => {
            const base = item.basePrice || 0;
            const sizeAdj = item.size?.priceAdjustment || 0;
            const addOnsTotal = (item.addOns || []).reduce(
              (sum, ao) => sum + (ao.price || 0),
              0
            );
            const itemTotal = (base + sizeAdj + addOnsTotal) * item.quantity;

            return (
              <div key={item.uniqueId} className="flex items-start justify-between gap-2">
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
                  {formatPrice(itemTotal)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-2xl p-4 shadow-warm mb-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-charcoal/60">Subtotal</span>
          <span className="text-brand-charcoal tabular-nums">{formattedSubtotal}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-charcoal/60">Delivery Fee</span>
          <span className="text-brand-charcoal tabular-nums">{formattedDeliveryFee}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-charcoal/60">Estimated Tax (8.5%)</span>
          <span className="text-brand-charcoal tabular-nums">{formattedTax}</span>
        </div>
        <div className="border-t border-brand-charcoal/5 pt-2 mt-2 flex items-center justify-between">
          <span className="font-display font-semibold text-brand-charcoal">Total</span>
          <span className="text-xl font-display font-bold text-brand-pink tabular-nums">
            {formattedTotal}
          </span>
        </div>
      </div>

      {/* Delivery address — Coming Soon */}
      <div className="bg-white rounded-2xl p-4 shadow-warm mb-4 opacity-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-display font-semibold text-brand-charcoal">Delivery Address</h2>
            <p className="text-xs text-brand-charcoal/50 mt-1">Coming soon</p>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-brand-charcoal/30 bg-brand-charcoal/5 px-2 py-0.5 rounded-full">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Mock payment method selector */}
      <div className="bg-white rounded-2xl p-4 shadow-warm mb-6">
        <h2 className="text-sm font-display font-semibold text-brand-charcoal mb-3">Payment Method</h2>
        <div className="space-y-2">
          <label
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
              paymentMethod === 'mock'
                ? 'border-brand-pink/30 bg-brand-pink/5'
                : 'border-brand-charcoal/10'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="mock"
              checked={paymentMethod === 'mock'}
              onChange={() => setPaymentMethod('mock')}
              className="w-4 h-4 text-brand-pink accent-brand-pink"
            />
            <div className="flex-1">
              <span className="text-sm text-brand-charcoal font-medium">Mock Payment</span>
              <p className="text-xs text-brand-charcoal/40">Simulated payment — no charge</p>
            </div>
          </label>
          <label
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors opacity-50 ${
              paymentMethod === 'card'
                ? 'border-brand-pink/30 bg-brand-pink/5'
                : 'border-brand-charcoal/10'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              disabled
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
              className="w-4 h-4 text-brand-pink accent-brand-pink"
            />
            <div className="flex-1">
              <span className="text-sm text-brand-charcoal font-medium">Credit / Debit Card</span>
              <p className="text-xs text-brand-charcoal/40">Coming soon</p>
            </div>
          </label>
          <label
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors opacity-50 ${
              paymentMethod === 'cash'
                ? 'border-brand-pink/30 bg-brand-pink/5'
                : 'border-brand-charcoal/10'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              disabled
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
              className="w-4 h-4 text-brand-pink accent-brand-pink"
            />
            <div className="flex-1">
              <span className="text-sm text-brand-charcoal font-medium">Cash</span>
              <p className="text-xs text-brand-charcoal/40">Coming soon</p>
            </div>
          </label>
        </div>
      </div>

      {/* Place order button */}
      <Button
        className="w-full"
        size="lg"
        loading={placing}
        onClick={handlePlaceOrder}
      >
        Place Order — {formattedTotal}
      </Button>

      <p className="text-xs text-center text-brand-charcoal/30 mt-3 mb-8">
        This is a simulated payment. No real charge will be made.
      </p>
    </PageContainer>
  );
}
