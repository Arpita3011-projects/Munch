import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import { formatINR } from '../components/domain/analytics/analyticsUtils';
import { CartContext } from '../context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useContext(CartContext);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const sizeAdjustment = item.size?.priceAdjustment || 0;
      const addOnsTotal = (item.addOns || []).reduce((a, addOn) => a + (addOn.price || 0), 0);
      return sum + (item.basePrice + sizeAdjustment + addOnsTotal) * item.quantity;
    }, 0);
  }, [items]);

  const formattedSubtotal = formatINR(subtotal);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Cart</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-charcoal/5 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3.75 3.75 0 00-3.75 3.75h15.75M5.25 4.5l1.5 5.25m0 0l1.25 4.5m-1.25-4.5h12.25a1.125 1.125 0 011.082 1.382l-1.5 5.25a1.125 1.125 0 01-1.082.868H7.5m0 0l-1.078 3.75" />
            </svg>
          </div>
          <p className="text-brand-charcoal/60 mb-4">Your cart is empty</p>
          <Link to="/" className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors min-h-[44px]">
            Browse Menu
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-brand-charcoal">Cart</h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-error/70 hover:text-error font-medium transition-colors min-h-[44px] px-2"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item) => {
          const sizeAdjustment = item.size?.priceAdjustment || 0;
          const addOnsTotal = (item.addOns || []).reduce((sum, addOn) => sum + (addOn.price || 0), 0);
          const itemTotal = (item.basePrice + sizeAdjustment + addOnsTotal) * item.quantity;
          const formattedItemTotal = formatINR(itemTotal);

          return (
            <div key={item.uniqueId} className="bg-white rounded-2xl p-4 shadow-warm">
              <div className="flex gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-brand-charcoal/5"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-brand-charcoal text-sm truncate">{item.name}</h3>
                      {item.size && (
                        <p className="text-xs text-brand-charcoal/50 mt-0.5">{item.size.name}</p>
                      )}
                      {item.addOns && item.addOns.length > 0 && (
                        <p className="text-xs text-brand-charcoal/40 mt-0.5 truncate">
                          + {item.addOns.map((a) => a.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-display font-semibold text-brand-charcoal whitespace-nowrap tabular-nums">
                      {formattedItemTotal}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 rounded-full border border-brand-charcoal/10 flex items-center justify-center text-brand-charcoal/40 hover:text-brand-charcoal hover:border-brand-charcoal/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                        </svg>
                      </button>
                      <span className="text-sm font-display font-semibold text-brand-charcoal w-6 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}
                        disabled={item.quantity >= 99}
                        className="w-8 h-8 rounded-full border border-brand-charcoal/10 flex items-center justify-center text-brand-charcoal/40 hover:text-brand-charcoal hover:border-brand-charcoal/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.uniqueId)}
                      className="text-xs text-error/60 hover:text-error font-medium transition-colors min-h-[44px] px-2"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-warm mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-brand-charcoal/60">Subtotal ({itemCount} items)</span>
          <span className="text-lg font-display font-bold text-brand-charcoal tabular-nums">{formattedSubtotal}</span>
        </div>
        <p className="text-xs text-brand-charcoal/40 mb-4">Tax and delivery fee calculated at checkout</p>
        <Link to="/checkout" className="block">
          <Button className="w-full">Proceed to Checkout</Button>
        </Link>
      </div>
    </PageContainer>
  );
}
