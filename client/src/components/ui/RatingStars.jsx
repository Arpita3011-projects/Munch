/**
 * Displays a star rating.
 *
 * Props:
 *  - value: number (0–5) — the rating to display.
 *  - max (optional): number — total stars (default 5).
 *  - size (optional): string — Tailwind sizing class for each star (default 'w-5 h-5').
 *  - interactive (optional): boolean — render as a set of clickable buttons (for rating input).
 *  - onChange (optional): function(number) — called with the selected rating when interactive.
 */
function Star({ filled, size, onClick, disabled, label, interactive }) {
  const cls = `inline-block flex-shrink-0 ${size} ${filled ? 'text-amber-400' : 'text-brand-charcoal/15'}`;
  const svg = (
    <svg
      className={cls}
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? 0 : 1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="p-0.5 -m-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded"
      >
        {svg}
      </button>
    );
  }

  return svg;
}

export default function RatingStars({
  value = 0,
  max = 5,
  size = 'w-5 h-5',
  interactive = false,
  onChange,
  disabled = false,
  className = '',
}) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    const filled = i <= Math.round(value);
    stars.push(
      <Star
        key={i}
        filled={filled}
        size={size}
        interactive={interactive}
        disabled={disabled}
        onClick={() => onChange && onChange(i)}
        label={`${i} star${i > 1 ? 's' : ''}`}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Select rating' : `${value} out of ${max} stars`}
    >
      {stars}
    </div>
  );
}

