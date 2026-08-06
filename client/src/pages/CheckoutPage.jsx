import { useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Input from '../components/ui/Input';
import AddressFormModal from '../components/domain/AddressFormModal';
import { formatINR } from '../components/domain/analytics/analyticsUtils';
import { PAYMENT_METHODS, DEFAULT_PAYMENT_METHOD, isValidUPI, isValidCardNumber, isValidExpiry, isValidCVV } from '../lib/payment';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { useAddresses } from '../hooks/useAddresses';

/**
 * Format price in INR.
 */
function formatPrice(amount) {
  return formatINR(amount);
}

const DELIVERY_FEE = 3.99;
const TAX_RATE = 0.085;

const TYPE_LABELS = {
  home: 'Home',
  work: 'Work',
  other: 'Other',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, clearCart, subtotal } = useContext(CartContext);
  const {
    addresses,
    loading: addressesLoading,
    error: addressesError,
    refreshAddresses,
    createAddress,
  } = useAddresses();

  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHOD);
  const [placing, setPlacing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [error, setError] = useState(null);
  const [orderCreated, setOrderCreated] = useState(null);

  // UPI state
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState(null);

  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardErrors, setCardErrors] = useState({});

  // Address selection state
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressModalError, setAddressModalError] = useState(null);

  // Automatically select the default address once addresses load.
  useEffect(() => {
    if (addresses.length === 0) {
      if (!addressesLoading && selectedAddressId) setSelectedAddressId(null);
      return;
    }
    const currentStillExists = addresses.some((a) => a._id === selectedAddressId);
    if (currentStillExists) return;
    const def = addresses.find((a) => a.isDefault) || addresses[0];
    setSelectedAddressId(def._id);
  }, [addresses, addressesLoading, selectedAddressId]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId) || null;

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

  const handleAddAddress = async (payload) => {
    setAddressSaving(true);
    setAddressModalError(null);
    try {
      const created = await createAddress(payload);
      setSelectedAddressId(created._id);
      setAddressModalOpen(false);
    } catch (err) {
      setAddressModalError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to save address. Please try again.'
      );
    } finally {
      setAddressSaving(false);
    }
  };

  /**
   * Validate the currently selected payment method's form.
   * Returns true when the method can proceed to order placement.
   */
  const validatePayment = () => {
    setUpiError(null);
    setCardErrors({});

    if (paymentMethod === 'UPI') {
      if (!upiId.trim()) {
        setUpiError('Please enter your UPI ID.');
        return false;
      }
      if (!isValidUPI(upiId)) {
        setUpiError('Enter a valid UPI ID, e.g. yourname@okhdfc or yourname@ybl.');
        return false;
      }
      return true;
    }

    if (paymentMethod === 'Card') {
      const errors = {};
      if (!cardNumber.trim()) {
        errors.cardNumber = 'Card number is required.';
      } else if (!isValidCardNumber(cardNumber)) {
        errors.cardNumber = 'Enter a valid 16-digit card number.';
      }
      if (!cardHolder.trim()) {
        errors.cardHolder = 'Card holder name is required.';
      }
      if (!cardExpiry.trim()) {
        errors.cardExpiry = 'Expiry is required.';
      } else if (!isValidExpiry(cardExpiry)) {
        errors.cardExpiry = 'Use MM/YY and a future date.';
      }
      if (!cardCvv.trim()) {
        errors.cardCvv = 'CVV is required.';
      } else if (!isValidCVV(cardCvv)) {
        errors.cardCvv = 'Enter a valid 3-digit CVV.';
      }
      setCardErrors(errors);
      return Object.keys(errors).length === 0;
    }

    // Cash on Delivery — no form.
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address.');
      return;
    }

    setError(null);

    // Validate the selected payment method's form before paying.
    if (!validatePayment()) {
      return;
    }

    // Simulate payment processing for non-COD methods.
    if (paymentMethod !== 'Cash on Delivery') {
      setPaying(true);
      await new Promise((resolve) => setTimeout(resolve, 1600));
      setPaying(false);
      setPaySuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setPaySuccess(false);
    }

    setPlacing(true);

    try {
      // Build items payload — client sends only identifiers, backend recalculates prices
      const payload = {
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          size: {
            name: item.size?.name || 'Regular',
            priceAdjustment: Number(item.size?.priceAdjustment) || 0,
          },
          addOns: (item.addOns || []).map((ao) => ({
            name: ao.name,
            price: Number(ao.price) || 0,
          })),
          quantity: item.quantity,
        })),
        paymentMethod,
        address: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          line1: selectedAddress.house,
          line2: selectedAddress.street,
          landmark: selectedAddress.landmark || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.pincode,
          type: selectedAddress.type || 'home',
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

  const handleCardNumberChange = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
    if (digits.length <= 2) {
      setCardExpiry(digits);
    } else {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    }
  };

  const handleCvvChange = (e) => {
    setCardCvv(e.target.value.replace(/[^\d]/g, '').slice(0, 3));
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

      {/* Delivery address */}
      <div className="bg-white rounded-2xl p-4 shadow-warm mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-display font-semibold text-brand-charcoal">Delivery Address</h2>
          {addresses.length > 0 && (
            <Link
              to="/addresses"
              className="text-xs font-semibold text-brand-pink hover:text-brand-pink-dark transition-colors"
            >
              Manage Addresses
            </Link>
          )}
        </div>

        {addressesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : addressesError ? (
          <div className="text-sm text-brand-charcoal/60 flex items-center justify-between gap-3 py-2">
            <span>{addressesError}</span>
            <button onClick={refreshAddresses} className="text-brand-pink font-semibold text-xs underline cursor-pointer">
              Retry
            </button>
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-brand-pink/10 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-brand-charcoal mb-1">No delivery address found</p>
            <p className="text-xs text-brand-charcoal/50 mb-4">Add an address to continue with checkout.</p>
            <Button className="px-5 py-2 text-sm rounded-full" onClick={() => setAddressModalOpen(true)}>
              + Add Address
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {addresses.map((address) => {
              const isSelected = selectedAddressId === address._id;
              const typeLabel = TYPE_LABELS[address.type] || 'Other';
              return (
                <label
                  key={address._id}
                  className={`flex items-start gap-3 px-4 py-3 rounded-2xl border-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-brand-pink/40 bg-brand-pink/5'
                      : 'border-brand-charcoal/10 hover:border-brand-charcoal/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryAddress"
                    value={address._id}
                    checked={isSelected}
                    onChange={() => setSelectedAddressId(address._id)}
                    className="mt-1 w-4 h-4 text-brand-pink accent-brand-pink flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-brand-charcoal">{address.fullName}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/50 bg-brand-charcoal/5 px-2 py-0.5 rounded-full">
                        {typeLabel}
                      </span>
                      {address.isDefault && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-success bg-success/10 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-charcoal/40 tabular-nums mt-0.5">{address.phone}</p>
                    <p className="text-sm text-brand-charcoal/70 mt-1 leading-relaxed">
                      {address.house}, {address.street}
                      {address.landmark && <span className="text-brand-charcoal/50"> ({address.landmark})</span>}
                    </p>
                    <p className="text-xs text-brand-charcoal/50">
                      {address.city}, {address.state} — {address.pincode}
                    </p>
                  </div>
                </label>
              );
            })}
            <Button
              variant="outline"
              className="w-full py-2.5 rounded-full text-sm"
              onClick={() => setAddressModalOpen(true)}
            >
              + Add Address
            </Button>
          </div>
        )}
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

      {/* Payment Method Selector */}
      <div className="bg-white rounded-2xl p-4 shadow-warm mb-6">
        <h2 className="text-sm font-display font-semibold text-brand-charcoal mb-3">Payment Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = paymentMethod === method.id;
            return (
              <label
                key={method.id}
                className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'border-brand-pink/40 bg-brand-pink/5 shadow-sm'
                    : 'border-brand-charcoal/10 hover:border-brand-charcoal/20'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => {
                    setPaymentMethod(method.id);
                    setError(null);
                  }}
                  className="mt-0.5 w-4 h-4 text-brand-pink accent-brand-pink flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-semibold block ${isSelected ? 'text-brand-charcoal' : 'text-brand-charcoal/70'}`}>
                    {method.label}
                  </span>
                  <span className="text-xs text-brand-charcoal/40 mt-0.5 block leading-snug">
                    {method.subtitle}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* UPI details */}
        {paymentMethod === 'UPI' && (
          <div className="mt-4 border-t border-brand-charcoal/5 pt-4 animate-fade-in">
            <h3 className="text-sm font-display font-semibold text-brand-charcoal mb-3">Pay via UPI</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <Input
                label="UPI ID"
                type="text"
                placeholder="yourname@okhdfc"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  if (upiError) setUpiError(null);
                }}
                error={upiError}
                helpText="Demo mode — no real payment is made."
                autoComplete="off"
              />
              {/* QR placeholder */}
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-brand-charcoal/20 bg-brand-cream/50 p-5">
                <div className="w-24 h-24 rounded-xl bg-white border border-brand-charcoal/10 flex items-center justify-center shadow-sm">
                  <svg className="w-14 h-14 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                  </svg>
                </div>
                <p className="text-[11px] text-brand-charcoal/40 text-center font-medium">
                  Scan to pay (demo)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card details */}
        {paymentMethod === 'Card' && (
          <div className="mt-4 border-t border-brand-charcoal/5 pt-4 animate-fade-in">
            <h3 className="text-sm font-display font-semibold text-brand-charcoal mb-3">Card Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Card Number"
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                error={cardErrors.cardNumber}
                helpText="Demo mode — card details are never stored."
                autoComplete="off"
              />
              <Input
                label="Card Holder"
                type="text"
                placeholder="Name on card"
                value={cardHolder}
                onChange={(e) => {
                  setCardHolder(e.target.value);
                  if (cardErrors.cardHolder) {
                    setCardErrors((prev) => ({ ...prev, cardHolder: undefined }));
                  }
                }}
                error={cardErrors.cardHolder}
                autoComplete="off"
              />
              <Input
                label="Expiry"
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={handleExpiryChange}
                error={cardErrors.cardExpiry}
                autoComplete="off"
              />
              <Input
                label="CVV"
                type="password"
                inputMode="numeric"
                placeholder="•••"
                value={cardCvv}
                onChange={handleCvvChange}
                error={cardErrors.cardCvv}
                autoComplete="off"
              />
            </div>
          </div>
        )}
      </div>

      {/* Payment success animation */}
      {paySuccess && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-sm px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in" role="status">
          <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <span className="font-semibold">Payment Successful</span>
        </div>
      )}

      {/* Place order button */}
      <Button
        className="w-full"
        size="lg"
        loading={placing || paying}
        onClick={handlePlaceOrder}
      >
        {paying
          ? 'Processing Payment…'
          : paymentMethod === 'Cash on Delivery'
          ? `Place Order — ${formattedTotal}`
          : `Pay ${formattedTotal} & Place Order`}
      </Button>

      <p className="text-xs text-center text-brand-charcoal/30 mt-3 mb-8">
        Demo checkout — no real payment is processed.
      </p>

      {/* Add address modal (inline checkout) */}
      <AddressFormModal
        isOpen={addressModalOpen}
        address={null}
        saving={addressSaving}
        error={addressModalError}
        onClose={() => setAddressModalOpen(false)}
        onSubmit={handleAddAddress}
      />
    </PageContainer>
  );
}

