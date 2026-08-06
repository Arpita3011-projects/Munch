import Card from '../../ui/Card';

/**
 * Animated stat card for the analytics dashboard.
 * Each card gets a subtle fade/slide-in via the animate-slide-up class
 * (defined in the Tailwind theme) and is fully responsive.
 */
export default function StatCard({
  label,
  value,
  sub,
  accent = 'bg-brand-pink/10 text-brand-pink',
  icon,
  className = '',
}) {
  return (
    <Card
      className={`p-5 border border-brand-cream-2 rounded-2xl animate-slide-up hover:shadow-warm-lg transition-all duration-300 group ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl md:text-3xl font-display font-extrabold text-brand-charcoal tabular-nums leading-none truncate">
            {value}
          </p>
          <p className="text-xs text-brand-charcoal/50 mt-1.5 truncate">{label}</p>
          {sub && (
            <p className="text-[11px] font-semibold mt-1 text-brand-charcoal/40 truncate">
              {sub}
            </p>
          )}
        </div>
        <div
          className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${accent}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

