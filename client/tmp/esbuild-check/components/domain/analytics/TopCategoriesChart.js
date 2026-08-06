import { jsx, jsxs } from "react/jsx-runtime";
const CATEGORY_COLORS = [
  "bg-brand-pink",
  "bg-accent-rainbow-0",
  "bg-accent-rainbow-1",
  "bg-accent-rainbow-2",
  "bg-accent-rainbow-3",
  "bg-accent-rainbow-4"
];
export default function TopCategoriesChart({ data = [] }) {
  if (!data || data.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "text-sm text-brand-charcoal/40 py-10 text-center", children: "No category data yet." });
  }
  const maxQty = Math.max(...data.map((d) => Number(d.quantity) || 0), 1);
  return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: data.map((cat, idx) => {
    const pct = Math.max(4, Number(cat.quantity) / maxQty * 100);
    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
    return /* @__PURE__ */ jsxs("div", { className: "group", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-1.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: `w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}` }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-brand-charcoal truncate", children: cat.category })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-brand-charcoal tabular-nums flex-shrink-0", children: [
          "\xD7",
          cat.quantity
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-2 bg-brand-charcoal/5 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: `h-full ${color} rounded-full transition-all duration-500 group-hover:opacity-80`,
          style: { width: `${pct}%` }
        }
      ) })
    ] }, cat.category);
  }) });
}
