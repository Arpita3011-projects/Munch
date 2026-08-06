import { formatCompactINR, monthLabel } from './analyticsUtils';

/**
 * Monthly revenue bar chart.
 *
 * Renders a pure-CSS/SVG bar chart — no external chart library. The bar
 * heights are proportional to the max revenue in the window. Works fully
 * offline and is responsive (SVG scales to its container width).
 */
export default function MonthlyRevenueChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-brand-charcoal/40 py-10 text-center">
        No revenue data yet.
      </p>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => Number(d.revenue) || 0), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5 md:gap-2 h-40 md:h-48">
        {data.map((d, idx) => {
          const heightPct = Math.max(4, (Number(d.revenue) / maxRevenue) * 100);
          const isCurrent =
            d.year === new Date().getFullYear() && d.month === new Date().getMonth() + 1;
          return (
            <div
              key={`${d.year}-${d.month}`}
              className="flex-1 flex flex-col items-center justify-end h-full group"
            >
              <div className="relative w-full flex justify-center">
                {/* Tooltip */}
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-brand-charcoal text-white text-[10px] md:text-[11px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap">
                    {formatCompactINR(d.revenue)}
                  </div>
                </div>
                <div
                  className={`w-full max-w-[36px] md:max-w-[44px] rounded-t-lg transition-all duration-500 ${
                    isCurrent
                      ? 'bg-brand-pink'
                      : 'bg-brand-pink/25 group-hover:bg-brand-pink/50'
                  }`}
                  style={{ height: `${Math.max(6, (heightPct / 100) * (160 / 2))}px` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1.5 md:gap-2 mt-2">
        {data.map((d, idx) => (
          <div
            key={`${d.year}-${d.month}-label`}
            className="flex-1 text-center text-[9px] md:text-[10px] font-semibold text-brand-charcoal/40 truncate"
          >
            {monthLabel(d.month)}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 text-[11px] text-brand-charcoal/40">
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-brand-pink" />
        Current month
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-brand-pink/25 ml-2" />
        Previous months
      </div>
    </div>
  );
}

