import { jsx, jsxs } from "react/jsx-runtime";
import Card from "../../ui/Card";
export default function StatCard({
  label,
  value,
  sub,
  accent = "bg-brand-pink/10 text-brand-pink",
  icon,
  className = ""
}) {
  return /* @__PURE__ */ jsx(
    Card,
    {
      className: `p-5 border border-brand-cream-2 rounded-2xl animate-slide-up hover:shadow-warm-lg transition-all duration-300 group ${className}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl md:text-3xl font-display font-extrabold text-brand-charcoal tabular-nums leading-none truncate", children: value }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-brand-charcoal/50 mt-1.5 truncate", children: label }),
          sub && /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold mt-1 text-brand-charcoal/40 truncate", children: sub })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${accent}`,
            children: icon
          }
        )
      ] })
    }
  );
}
