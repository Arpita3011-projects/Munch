import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import PageContainer from '../components/layout/PageContainer';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import RatingStars from '../components/ui/RatingStars';
import ReviewsSection from '../components/domain/ReviewsSection';
import { formatINR } from '../components/domain/analytics/analyticsUtils';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { useReviews } from '../hooks/useReviews';
import { CartContext } from '../context/CartContext';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useContext(CartContext);
  const { getMenuReviews } = useReviews();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [reviewSummary, setReviewSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        setAddedToCart(false);
        const res = await api.get(`/menu/${id}`);
        if (!cancelled) {
          setItem(res.data.data.item);
          setSelectedSize(0);
          setSelectedAddOns([]);
          setQuantity(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load item');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchItem();
    return () => { cancelled = true; };
  }, [id]);

  // Load the review summary for the rating shown in the details header.
  useEffect(() => {
    if (!item) return;
    let cancelled = false;
    const load = async () => {
      const result = await getMenuReviews(item._id);
      if (!cancelled && result.success && result.data) {
        setReviewSummary({
          average: result.data.average || 0,
          count: result.data.count || 0,
        });
      }
    };
    load();
    return () => { cancelled = true; };
  }, [item, getMenuReviews]);

  const toggleAddOn = useCallback((addOnIndex) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnIndex)
        ? prev.filter((i) => i !== addOnIndex)
        : [...prev, addOnIndex]
    );
  }, []);

  const totalPrice = useMemo(() => {
    if (!item) return 0;
    const sizeAdjustment = item.sizes?.[selectedSize]?.priceAdjustment || 0;
    const addOnsTotal = selectedAddOns.reduce((sum, idx) => {
      return sum + (item.addOns?.[idx]?.price || 0);
    }, 0);
    return (item.price + sizeAdjustment + addOnsTotal) * quantity;
  }, [item, selectedSize, selectedAddOns, quantity]);

  const formattedTotal = useMemo(() => formatINR(totalPrice), [totalPrice]);

  const handleAddToCart = useCallback(() => {
    if (!item) return;
    addToCart({
      menuItemId: item._id,
      name: item.name,
      basePrice: item.price,
      image: item.image,
      size: item.sizes?.[selectedSize] || { name: 'Regular', priceAdjustment: 0 },
      addOns: selectedAddOns.map((idx) => item.addOns[idx]).filter(Boolean),
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [item, selectedSize, selectedAddOns, quantity, addToCart]);

  const handleFavoriteClick = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/item/${id}` } });
      return;
    }
    toggleFavorite(item._id).catch(() => {});
  }, [isAuthenticated, navigate, id, item, toggleFavorite]);

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Image skeleton */}
            <div className="lg:col-span-5">
<Skeleton className="w-full aspect-[4/3] lg:aspect-auto lg:h-[440px] rounded-3xl" />
            </div>
            {/* Details skeleton */}
            <div className="lg:col-span-7 space-y-4">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-3 mt-4">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !item) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-brand-charcoal/60 mb-1">{error || 'Item not found'}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors motion-reduce:transition-none min-h-[44px] mt-4"
          >
            Go Back
          </button>
        </div>
      </PageContainer>
    );
  }

  const isFav = isFavorite(item._id);

  return (
    <div className="min-h-screen">
      <PageContainer>
        <div className="max-w-6xl mx-auto">
{/* Desktop 2-column layout — image left (≈38%), details right (≈62%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 lg:items-start">
            {/* Left column: product image */}
            <div className="lg:col-span-5">
              <div className="relative w-full rounded-3xl overflow-hidden bg-brand-charcoal/5 shadow-warm">
                {/* Image — capped height, object-cover, never stretches vertically */}
                <div className="aspect-[4/3] lg:aspect-auto lg:h-[440px] lg:max-h-[440px]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/600x450/F5A623/FFF8F0?text=${encodeURIComponent(item.name.charAt(0))}`;
                    }}
                  />
                </div>
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5 text-brand-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                {/* Favorite button */}
                <button
                  type="button"
                  onClick={handleFavoriteClick}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                    isFav
                      ? 'bg-brand-pink/90 text-white hover:bg-brand-pink'
                      : 'bg-white/90 text-brand-charcoal/40 hover:bg-white hover:text-brand-pink'
                  }`}
                  aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isFav ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={isFav ? 0 : 1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>
            </div>

{/* Right column: details */}
            <div className="lg:col-span-7">
              {/* Category badge */}
              <Badge className="mb-3">
                {item.category}
              </Badge>

              {/* Product name */}
              <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-charcoal leading-tight">
                {item.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <RatingStars value={reviewSummary?.average || 0} size="w-4 h-4" />
                {reviewSummary && reviewSummary.count > 0 ? (
                  <span className="text-sm font-medium text-brand-charcoal/60">
                    {reviewSummary.average.toFixed(1)} ({reviewSummary.count} review{reviewSummary.count !== 1 ? 's' : ''})
                  </span>
                ) : (
                  <span className="text-sm text-brand-charcoal/40">No ratings yet</span>
                )}
              </div>

              {/* Description */}
              <p className="text-brand-charcoal/60 text-sm leading-relaxed mt-4">
                {item.description}
              </p>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block text-[10px] font-medium uppercase tracking-wider text-brand-charcoal/40 bg-brand-charcoal/5 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 mt-5">
                <span className="text-2xl md:text-3xl font-display font-extrabold text-brand-pink tabular-nums">
                  {formatINR(item.price)}
                </span>
              </div>

              <hr className="my-5 border-brand-charcoal/5" />

              {/* Size selection */}
              {item.sizes && item.sizes.length > 1 && (
                <section className="mb-6" aria-label="Select size">
                  <h2 className="text-sm font-display font-semibold text-brand-charcoal mb-3">Size</h2>
                  <div className="flex flex-wrap gap-2">
                    {item.sizes.map((size, idx) => (
                      <button
                        key={size.name}
                        type="button"
                        onClick={() => setSelectedSize(idx)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors motion-reduce:transition-none min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                          selectedSize === idx
                            ? 'bg-brand-pink text-white shadow-sm'
                            : 'bg-white text-brand-charcoal/60 border border-brand-charcoal/10 hover:border-brand-charcoal/20 hover:text-brand-charcoal'
                        }`}
                        aria-pressed={selectedSize === idx}
                      >
                        {size.name}
                        {size.priceAdjustment > 0 && (
                          <span className="ml-1.5 text-xs opacity-70">
                            +{formatINR(size.priceAdjustment)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Add-ons */}
              {item.addOns && item.addOns.length > 0 && (
                <section className="mb-6" aria-label="Select add-ons">
                  <h2 className="text-sm font-display font-semibold text-brand-charcoal mb-3">Add-ons</h2>
                  <div className="space-y-2">
                    {item.addOns.map((addOn, idx) => (
                      <label
                        key={addOn.name}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors motion-reduce:transition-none cursor-pointer min-h-[44px] ${
                          selectedAddOns.includes(idx)
                            ? 'border-brand-pink/30 bg-brand-pink/5'
                            : 'border-brand-charcoal/10 bg-white hover:border-brand-charcoal/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAddOns.includes(idx)}
                          onChange={() => toggleAddOn(idx)}
                          className="w-5 h-5 rounded border-brand-charcoal/20 text-brand-pink focus:ring-brand-pink/30 accent-brand-pink"
                        />
                        <span className="flex-1 text-sm text-brand-charcoal">{addOn.name}</span>
                        <span className="text-sm text-brand-charcoal/50">
                          +{formatINR(addOn.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              {/* Quantity selector */}
              <section className="mb-6" aria-label="Select quantity">
                <h2 className="text-sm font-display font-semibold text-brand-charcoal mb-3">Quantity</h2>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-11 h-11 rounded-full border border-brand-charcoal/10 flex items-center justify-center text-brand-charcoal/60 hover:text-brand-charcoal hover:border-brand-charcoal/20 transition-colors motion-reduce:transition-none disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                    aria-label="Decrease quantity"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                  </button>
                  <span className="text-xl font-display font-bold text-brand-charcoal w-8 text-center tabular-nums" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    disabled={quantity >= 99}
                    className="w-11 h-11 rounded-full border border-brand-charcoal/10 flex items-center justify-center text-brand-charcoal/60 hover:text-brand-charcoal hover:border-brand-charcoal/20 transition-colors motion-reduce:transition-none disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                    aria-label="Increase quantity"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </section>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full text-sm font-medium text-white transition-all motion-reduce:transition-none min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 ${
                  addedToCart
                    ? 'bg-success scale-95'
                    : 'bg-brand-pink hover:bg-brand-pink-dark active:scale-95'
                }`}
                aria-label={`Add to cart for ${formattedTotal}`}
              >
                {addedToCart ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Added!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3.75 3.75 0 00-3.75 3.75h15.75M5.25 4.5l1.5 5.25m0 0l1.25 4.5m-1.25-4.5h12.25a1.125 1.125 0 011.082 1.382l-1.5 5.25a1.125 1.125 0 01-1.082.868H7.5m0 0l-1.078 3.75" />
                    </svg>
                    Add to Cart — {formattedTotal}
                  </>
                )}
              </button>
            </div>
</div>

          {/* Reviews below the product section */}
          <div className="mt-10">
            <ReviewsSection menuItemId={id} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

