import { jsx, jsxs } from "react/jsx-runtime";
import { formatINR } from "./analyticsUtils";
export default function TopSellingItemsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "text-sm text-brand-charcoal/40 py-10 text-center", children: "No sales data yet." });
  }
  const maxQty = Math.max(...data.map((d) => Number(d.quantity) || 0), 1);
  return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: data.map((item, idx) => {
    const pct = Math.max(4, Number(item.quantity) / maxQty * 100);
    return /* @__PURE__ */ jsxs("div", { className: "group", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-1.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: "w-5 h-5 rounded-full bg-brand-charcoal/5 text-brand-charcoal/50 text-[11px] font-bold flex items-center justify-center flex-shrink-0", children: idx + 1 }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-brand-charcoal truncate", children: item.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-brand-charcoal tabular-nums", children: [
            "\xD7",
            item.quantity
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-brand-charcoal/40 tabular-nums hidden sm:inline", children: formatINR(item.revenue) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-2 bg-brand-charcoal/5 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full bg-gradient-to-r from-brand-pink to-brand-pink/70 rounded-full transition-all duration-500 group-hover:opacity-80",
          style: { width: `${pct}%` }
        }
      ) })
    ] }, item.name);
  }) });
}
