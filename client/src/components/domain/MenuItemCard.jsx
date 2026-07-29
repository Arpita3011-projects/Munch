import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

/**
 * Reusable menu item card.
 *
 * Displays the item image, name, description, price, tags, and
 * functional favourite heart button (wired via onToggleFavorite prop).
 * Add-to-cart button navigates to item detail page.
 *
 * @param {object} item - Menu item object from the API
 * @param {boolean} isFavorite - Whether the item is favorited
 * @param {function} onToggleFavorite - Callback when heart is clicked
 */
export default function MenuItemCard({ item, isFavorite = false, onToggleFavorite }) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(item.price);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(item._id);
    }
  };

  return (
    <Link
      to={`/item/${item._id}`}
      className="group block bg-white rounded-2xl shadow-warm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
      aria-label={`View ${item.name} — ${formattedPrice}`}
    >
      {/* Image container with aspect-ratio to prevent layout shift */}
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-charcoal/5">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105 motion-reduce:group-hover:scale-100"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/400x300/F5A623/FFF8F0?text=${encodeURIComponent(item.name.charAt(0))}`;
          }}
        />
        {/* Favourite heart button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
            isFavorite
              ? 'bg-brand-pink/90 text-white hover:bg-brand-pink'
              : 'bg-white/90 text-brand-charcoal/40 hover:bg-white hover:text-brand-pink'
          }`}
          aria-label={isFavorite ? `Remove ${item.name} from favourites` : `Add ${item.name} to favourites`}
        >
          <svg
            className="w-5 h-5"
            fill={isFavorite ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isFavorite ? 0 : 1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="cream">{item.category}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-brand-charcoal text-base truncate">
          {item.name}
        </h3>
        <p className="text-sm text-brand-charcoal/60 mt-1 line-clamp-2">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-block text-[10px] font-medium uppercase tracking-wider text-brand-charcoal/40 bg-brand-charcoal/5 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-[10px] text-brand-charcoal/30">+{item.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Price and add-to-cart — UI only */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-charcoal/5">
          <span className="font-display font-bold text-brand-charcoal text-lg">
            {formattedPrice}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Add to cart — not implemented (Milestone 5)
            }}
            className="w-9 h-9 rounded-full bg-brand-pink flex items-center justify-center transition-colors hover:bg-brand-pink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
            aria-label={`Add ${item.name} to cart`}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}

