import Card from '../../ui/Card';

/**
 * Status card for the analytics dashboard — shows a count for a single
 * order status with a colored icon chip and subtle hover animation.
 */
export default function StatusCard({ label, value, accent = 'bg-brand-charcoal/10 text-brand-charcoal', icon, className = '' }) {
  return (
    <Card
      className={`p-4 md:p-5 border border-brand-cream-2 rounded-2xl animate-slide-up hover:shadow-warm-lg transition-all duration-300 group ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${accent}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xl md:text-2xl font-display font-extrabold text-brand-charcoal tabular-nums leading-none">
            {value}
          </p>
          <p className="text-[11px] md:text-xs text-brand-charcoal/50 mt-1 truncate">{label}</p>
        </div>
      </div>
    </Card>
  );
}

