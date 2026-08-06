import { jsx, jsxs } from "react/jsx-runtime";
import { formatINR, formatDay, formatTime } from "./analyticsUtils";
const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/50",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200/50",
  preparing: "bg-purple-50 text-purple-700 border-purple-200/50",
  ready: "bg-cyan-50 text-cyan-700 border-cyan-200/50",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200/50"
};
const statusLabels = {
  pending: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled"
};
export default function RecentOrdersTable({ orders = [] }) {
  if (!orders || orders.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "text-sm text-brand-charcoal/40 py-10 text-center", children: "No recent orders yet. New orders will appear here." });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "hidden md:block overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-brand-charcoal/5 text-[11px] font-bold text-brand-charcoal/30 uppercase tracking-wider", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left py-2.5 pr-3 font-bold", children: "Customer" }),
        /* @__PURE__ */ jsx("th", { className: "text-left py-2.5 pr-3 font-bold", children: "Items" }),
        /* @__PURE__ */ jsx("th", { className: "text-right py-2.5 pr-3 font-bold", children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: "text-left py-2.5 pr-3 font-bold", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "text-right py-2.5 font-bold", children: "Time" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-brand-charcoal/5", children: orders.map((order) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-brand-cream/10 transition-colors", children: [
        /* @__PURE__ */ jsxs("td", { className: "py-3 pr-3", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-brand-charcoal truncate max-w-[140px]", children: order.customer?.name || "Unknown" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-brand-charcoal/40 truncate max-w-[140px]", children: [
            "#",
            order._id.slice(-8).toUpperCase()
          ] })
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "py-3 pr-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-brand-charcoal/70 truncate max-w-[180px]", children: order.items?.[0]?.name || "\u2014" }),
          order.items && order.items.length > 1 && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-brand-charcoal/40", children: [
            "+",
            order.items.length - 1,
            " more"
          ] })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "py-3 pr-3 text-right font-bold text-brand-charcoal tabular-nums whitespace-nowrap", children: formatINR(order.total) }),
        /* @__PURE__ */ jsx("td", { className: "py-3 pr-3", children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${statusStyles[order.status] || "bg-brand-charcoal/5 text-brand-charcoal/60 border-brand-charcoal/10"}`, children: statusLabels[order.status] || order.status }) }),
        /* @__PURE__ */ jsxs("td", { className: "py-3 text-right text-brand-charcoal/50 whitespace-nowrap", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium", children: formatDay(order.createdAt) }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-brand-charcoal/40", children: formatTime(order.createdAt) })
        ] })
      ] }, order._id)) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "md:hidden divide-y divide-brand-charcoal/5", children: orders.map((order) => /* @__PURE__ */ jsxs("div", { className: "py-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-brand-charcoal truncate", children: order.customer?.name || "Unknown" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-brand-charcoal/40 mt-0.5", children: [
            "#",
            order._id.slice(-8).toUpperCase(),
            " \u2022 ",
            formatDay(order.createdAt),
            " \u2022 ",
            formatTime(order.createdAt)
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${statusStyles[order.status] || "bg-brand-charcoal/5 text-brand-charcoal/60 border-brand-charcoal/10"}`, children: statusLabels[order.status] || order.status })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-brand-charcoal/50 truncate pr-2", children: [
          order.items?.[0]?.name || "\u2014",
          order.items && order.items.length > 1 ? ` +${order.items.length - 1} more` : ""
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-brand-charcoal tabular-nums flex-shrink-0", children: formatINR(order.total) })
      ] })
    ] }, order._id)) })
  ] });
}
