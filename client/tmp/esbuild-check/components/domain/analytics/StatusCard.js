import { jsx, jsxs } from "react/jsx-runtime";
import Card from "../../ui/Card";
export default function StatusCard({ label, value, accent = "bg-brand-charcoal/10 text-brand-charcoal", icon, className = "" }) {
  return /* @__PURE__ */ jsx(
    Card,
    {
      className: `p-4 md:p-5 border border-brand-cream-2 rounded-2xl animate-slide-up hover:shadow-warm-lg transition-all duration-300 group ${className}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${accent}`,
            children: icon
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xl md:text-2xl font-display font-extrabold text-brand-charcoal tabular-nums leading-none", children: value }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] md:text-xs text-brand-charcoal/50 mt-1 truncate", children: label })
        ] })
      ] })
    }
  );
}
