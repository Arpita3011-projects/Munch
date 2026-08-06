/**
 * Most ordered categories — horizontal bars driven by order quantity.
 * Each category gets a distinct accent color from the app palette.
 */
const CATEGORY_COLORS = [
  'bg-brand-pink',
  'bg-accent-rainbow-0',
  'bg-accent-rainbow-1',
  'bg-accent-rainbow-2',
  'bg-accent-rainbow-3',
  'bg-accent-rainbow-4',
];

export default function TopCategoriesChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-brand-charcoal/40 py-10 text-center">
        No category data yet.
      </p>
    );
  }

  const maxQty = Math.max(...data.map((d) => Number(d.quantity) || 0), 1);

  return (
    <div className="space-y-4">
      {data.map((cat, idx) => {
        const pct = Math.max(4, (Number(cat.quantity) / maxQty) * 100);
        const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
        return (
          <div key={cat.category} className="group">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                <p className="text-sm font-semibold text-brand-charcoal truncate">
                  {cat.category}
                </p>
              </div>
              <span className="text-xs font-bold text-brand-charcoal tabular-nums flex-shrink-0">
                ×{cat.quantity}
              </span>
            </div>
            <div className="h-2 bg-brand-charcoal/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all duration-500 group-hover:opacity-80`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

