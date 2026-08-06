import { formatINR } from './analyticsUtils';

/**
 * Top selling menu items — horizontal ranked bars.
 * Quantity drives the bar width; revenue is shown as a secondary value.
 */
export default function TopSellingItemsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-brand-charcoal/40 py-10 text-center">
        No sales data yet.
      </p>
    );
  }

  const maxQty = Math.max(...data.map((d) => Number(d.quantity) || 0), 1);

  return (
    <div className="space-y-4">
      {data.map((item, idx) => {
        const pct = Math.max(4, (Number(item.quantity) / maxQty) * 100);
        return (
          <div key={item.name} className="group">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-brand-charcoal/5 text-brand-charcoal/50 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm font-semibold text-brand-charcoal truncate">
                  {item.name}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold text-brand-charcoal tabular-nums">
                  ×{item.quantity}
                </span>
                <span className="text-[11px] text-brand-charcoal/40 tabular-nums hidden sm:inline">
                  {formatINR(item.revenue)}
                </span>
              </div>
            </div>
            <div className="h-2 bg-brand-charcoal/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-pink to-brand-pink/70 rounded-full transition-all duration-500 group-hover:opacity-80"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

