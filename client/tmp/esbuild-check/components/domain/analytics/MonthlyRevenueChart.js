import { jsx, jsxs } from "react/jsx-runtime";
import { formatCompactINR, monthLabel } from "./analyticsUtils";
export default function MonthlyRevenueChart({ data = [] }) {
  if (!data || data.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "text-sm text-brand-charcoal/40 py-10 text-center", children: "No revenue data yet." });
  }
  const maxRevenue = Math.max(...data.map((d) => Number(d.revenue) || 0), 1);
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-end gap-1.5 md:gap-2 h-40 md:h-48", children: data.map((d, idx) => {
      const heightPct = Math.max(4, Number(d.revenue) / maxRevenue * 100);
      const isCurrent = d.year === (/* @__PURE__ */ new Date()).getFullYear() && d.month === (/* @__PURE__ */ new Date()).getMonth() + 1;
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "flex-1 flex flex-col items-center justify-end h-full group",
          children: /* @__PURE__ */ jsxs("div", { className: "relative w-full flex justify-center", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10", children: /* @__PURE__ */ jsx("div", { className: "bg-brand-charcoal text-white text-[10px] md:text-[11px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap", children: formatCompactINR(d.revenue) }) }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `w-full max-w-[36px] md:max-w-[44px] rounded-t-lg transition-all duration-500 ${isCurrent ? "bg-brand-pink" : "bg-brand-pink/25 group-hover:bg-brand-pink/50"}`,
                style: { height: `${Math.max(6, heightPct / 100 * (160 / 2))}px` }
              }
            )
          ] })
        },
        `${d.year}-${d.month}`
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 md:gap-2 mt-2", children: data.map((d, idx) => /* @__PURE__ */ jsx(
      "div",
      {
        className: "flex-1 text-center text-[9px] md:text-[10px] font-semibold text-brand-charcoal/40 truncate",
        children: monthLabel(d.month)
      },
      `${d.year}-${d.month}-label`
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-3 text-[11px] text-brand-charcoal/40", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block w-2.5 h-2.5 rounded-sm bg-brand-pink" }),
      "Current month",
      /* @__PURE__ */ jsx("span", { className: "inline-block w-2.5 h-2.5 rounded-sm bg-brand-pink/25 ml-2" }),
      "Previous months"
    ] })
  ] });
}
