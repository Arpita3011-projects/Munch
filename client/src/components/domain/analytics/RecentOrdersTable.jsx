import { formatINR, formatDay, formatTime } from './analyticsUtils';
import { paymentLabel } from '../../../lib/payment';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200/50',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200/50',
  preparing: 'bg-purple-50 text-purple-700 border-purple-200/50',
  ready: 'bg-cyan-50 text-cyan-700 border-cyan-200/50',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200/50',
};

const statusLabels = {
  pending: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/**
 * Recent orders table — desktop shows a full table; mobile collapses to
 * stacked cards. Columns: Customer, Items, Amount, Status, Time.
 */
export default function RecentOrdersTable({ orders = [] }) {
  if (!orders || orders.length === 0) {
    return (
      <p className="text-sm text-brand-charcoal/40 py-10 text-center">
        No recent orders yet. New orders will appear here.
      </p>
    );
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-charcoal/5 text-[11px] font-bold text-brand-charcoal/30 uppercase tracking-wider">
              <th className="text-left py-2.5 pr-3 font-bold">Customer</th>
              <th className="text-left py-2.5 pr-3 font-bold">Items</th>
              <th className="text-right py-2.5 pr-3 font-bold">Amount</th>
              <th className="text-left py-2.5 pr-3 font-bold">Payment</th>
              <th className="text-left py-2.5 pr-3 font-bold">Status</th>
              <th className="text-right py-2.5 font-bold">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-charcoal/5">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-brand-cream/10 transition-colors">
                <td className="py-3 pr-3">
                  <p className="font-semibold text-brand-charcoal truncate max-w-[140px]">
                    {order.customer?.name || 'Unknown'}
                  </p>
                  <p className="text-[11px] text-brand-charcoal/40 truncate max-w-[140px]">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </td>
                <td className="py-3 pr-3">
                  <p className="text-brand-charcoal/70 truncate max-w-[180px]">
                    {order.items?.[0]?.name || '—'}
                  </p>
                  {order.items && order.items.length > 1 && (
                    <p className="text-[11px] text-brand-charcoal/40">
                      +{order.items.length - 1} more
                    </p>
                  )}
                </td>
                <td className="py-3 pr-3 text-right font-bold text-brand-charcoal tabular-nums whitespace-nowrap">
                  {formatINR(order.total)}
                </td>
                <td className="py-3 pr-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border border-brand-charcoal/10 bg-brand-charcoal/5 text-brand-charcoal/60 whitespace-nowrap">
                    {paymentLabel(order.paymentMethod)}
                  </span>
                </td>
                <td className="py-3 pr-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${statusStyles[order.status] || 'bg-brand-charcoal/5 text-brand-charcoal/60 border-brand-charcoal/10'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </td>
                <td className="py-3 text-right text-brand-charcoal/50 whitespace-nowrap">
                  <p className="text-xs font-medium">{formatDay(order.createdAt)}</p>
                  <p className="text-[11px] text-brand-charcoal/40">{formatTime(order.createdAt)}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-brand-charcoal/5">
        {orders.map((order) => (
          <div key={order._id} className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-charcoal truncate">
                  {order.customer?.name || 'Unknown'}
                </p>
                <p className="text-[11px] text-brand-charcoal/40 mt-0.5">
                  #{order._id.slice(-8).toUpperCase()} &bull; {paymentLabel(order.paymentMethod)} &bull; {formatDay(order.createdAt)} &bull; {formatTime(order.createdAt)}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${statusStyles[order.status] || 'bg-brand-charcoal/5 text-brand-charcoal/60 border-brand-charcoal/10'}`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-brand-charcoal/50 truncate pr-2">
                {order.items?.[0]?.name || '—'}
                {order.items && order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
              </p>
              <span className="text-sm font-bold text-brand-charcoal tabular-nums flex-shrink-0">
                {formatINR(order.total)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

