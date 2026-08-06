import { jsx, jsxs } from "react/jsx-runtime";
import Card from "../../ui/Card";
import Skeleton from "../../ui/Skeleton";
export function StatCardSkeleton() {
  return /* @__PURE__ */ jsx(Card, { className: "p-5 border border-brand-cream-2 rounded-2xl", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex-1", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-20" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-28" })
    ] }),
    /* @__PURE__ */ jsx(Skeleton, { className: "w-11 h-11 rounded-2xl flex-shrink-0" })
  ] }) });
}
export function StatusCardSkeleton() {
  return /* @__PURE__ */ jsx(Card, { className: "p-4 md:p-5 border border-brand-cream-2 rounded-2xl", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "w-10 h-10 md:w-11 md:h-11 rounded-xl flex-shrink-0" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-10" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-20" })
    ] })
  ] }) });
}
export function ChartSkeleton({ rows = 4 }) {
  return /* @__PURE__ */ jsxs(Card, { className: "p-5 md:p-6 border border-brand-cream-2 rounded-2xl", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-40 mb-5" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-32" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-10" })
      ] }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-2 w-full rounded-full" })
    ] }, i)) })
  ] });
}
export function TableSkeleton({ rows = 5 }) {
  return /* @__PURE__ */ jsxs(Card, { className: "p-5 md:p-6 border border-brand-cream-2 rounded-2xl", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-40 mb-5" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" }, i)) })
  ] });
}
