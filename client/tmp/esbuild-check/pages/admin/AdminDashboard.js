import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import StatCard from "../../components/domain/analytics/StatCard";
import StatusCard from "../../components/domain/analytics/StatusCard";
import MonthlyRevenueChart from "../../components/domain/analytics/MonthlyRevenueChart";
import TopSellingItemsChart from "../../components/domain/analytics/TopSellingItemsChart";
import TopCategoriesChart from "../../components/domain/analytics/TopCategoriesChart";
import RecentOrdersTable from "../../components/domain/analytics/RecentOrdersTable";
import {
  StatCardSkeleton,
  StatusCardSkeleton,
  ChartSkeleton,
  TableSkeleton
} from "../../components/domain/analytics/DashboardSkeletons";
import { useAnalytics } from "../../hooks/useAnalytics";
import { formatINR } from "../../components/domain/analytics/analyticsUtils";
const statusCardConfig = [
  {
    key: "pending",
    label: "Pending",
    accent: "bg-amber-50 text-amber-600",
    icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" }) })
  },
  {
    key: "preparing",
    label: "Preparing",
    accent: "bg-purple-50 text-purple-600",
    icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" }) })
  },
  {
    key: "ready",
    label: "Out for Delivery",
    accent: "bg-cyan-50 text-cyan-600",
    icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" }) })
  },
  {
    key: "delivered",
    label: "Delivered",
    accent: "bg-emerald-50 text-emerald-600",
    icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })
  },
  {
    key: "cancelled",
    label: "Cancelled",
    accent: "bg-rose-50 text-rose-600",
    icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" }) })
  }
];
export default function AdminDashboard() {
  const { analytics, loading, error, lastUpdated, loadAnalytics, clearError } = useAnalytics();
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);
  const hasData = analytics && analytics.totalOrders > 0;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 md:space-y-8", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-col sm:flex-row sm:items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-display font-extrabold text-brand-charcoal", children: "Analytics Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-brand-charcoal/50 mt-1", children: "Live restaurant performance from real order data." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-brand-charcoal/40", children: [
        lastUpdated && /* @__PURE__ */ jsxs("span", { className: "hidden sm:inline", children: [
          "Updated ",
          lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: loadAnalytics,
            disabled: loading,
            className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-brand-charcoal/10 text-brand-charcoal/60 hover:text-brand-charcoal hover:border-brand-charcoal/20 transition-all font-semibold disabled:opacity-50 min-h-[36px] cursor-pointer",
            children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: `w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`,
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                  strokeWidth: 2,
                  children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" })
                }
              ),
              "Refresh"
            ]
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl flex items-center justify-between gap-3 animate-fade-in", role: "alert", children: [
      /* @__PURE__ */ jsxs("span", { className: "font-medium flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-rose-600 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
        error
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: clearError,
          className: "text-rose-700/60 hover:text-rose-800 transition-colors min-h-[44px] px-2",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("section", { "aria-label": "Key statistics", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-[11px] font-bold text-brand-charcoal/30 uppercase tracking-widest mb-3", children: "Overview" }),
      loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(StatCardSkeleton, {}, i)) }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4", children: [
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Total Orders",
            value: analytics?.totalOrders ?? 0,
            sub: analytics ? `${analytics.ordersToday ?? 0} today` : void 0,
            accent: "bg-brand-pink/10 text-brand-pink",
            icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Today's Orders",
            value: analytics?.ordersToday ?? 0,
            sub: "Placed today",
            accent: "bg-accent-rainbow-0/10 text-accent-rainbow-0",
            icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Total Revenue",
            value: analytics ? formatINR(analytics.totalRevenue) : "\u20B90",
            sub: analytics ? `AOV ${formatINR(analytics.averageOrderValue)}` : void 0,
            accent: "bg-emerald-50 text-emerald-600",
            icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Today's Revenue",
            value: analytics ? formatINR(analytics.todayRevenue) : "\u20B90",
            sub: "Earned today",
            accent: "bg-accent-rainbow-4/10 text-accent-rainbow-4",
            icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" }) })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { "aria-label": "Order status breakdown", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-[11px] font-bold text-brand-charcoal/30 uppercase tracking-widest mb-3", children: "Order Status" }),
      loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(StatusCardSkeleton, {}, i)) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4", children: statusCardConfig.map((cfg) => /* @__PURE__ */ jsx(
        StatusCard,
        {
          label: cfg.label,
          value: analytics?.statusCounts?.[cfg.key] ?? 0,
          accent: cfg.accent,
          icon: cfg.icon
        },
        cfg.key
      )) })
    ] }),
    /* @__PURE__ */ jsx("section", { "aria-label": "Charts", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-3 xl:col-span-3", children: loading ? /* @__PURE__ */ jsx(ChartSkeleton, { rows: 6 }) : /* @__PURE__ */ jsxs(Card, { className: "p-5 md:p-6 border border-brand-cream-2 rounded-2xl", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-5", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-display font-bold text-brand-charcoal", children: "Monthly Revenue" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-brand-charcoal/40 mt-0.5", children: "Last 12 months" })
        ] }) }),
        /* @__PURE__ */ jsx(MonthlyRevenueChart, { data: analytics?.monthlyRevenue || [] })
      ] }) }),
      loading ? /* @__PURE__ */ jsx(ChartSkeleton, { rows: 5 }) : /* @__PURE__ */ jsxs(Card, { className: "p-5 md:p-6 border border-brand-cream-2 rounded-2xl", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-display font-bold text-brand-charcoal mb-5", children: "Top Selling Items" }),
        /* @__PURE__ */ jsx(TopSellingItemsChart, { data: analytics?.topSellingItems || [] })
      ] }),
      loading ? /* @__PURE__ */ jsx(ChartSkeleton, { rows: 5 }) : /* @__PURE__ */ jsxs(Card, { className: "p-5 md:p-6 border border-brand-cream-2 rounded-2xl", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-display font-bold text-brand-charcoal mb-5", children: "Most Ordered Categories" }),
        /* @__PURE__ */ jsx(TopCategoriesChart, { data: analytics?.topCategories || [] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { "aria-label": "Recent orders", children: /* @__PURE__ */ jsxs(Card, { className: "p-5 md:p-6 border border-brand-cream-2 rounded-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-display font-bold text-brand-charcoal", children: "Recent Orders" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-brand-charcoal/40 mt-0.5", children: "Latest 10 orders" })
        ] }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/admin/orders",
            className: "text-sm font-semibold text-brand-pink hover:text-brand-pink-dark transition-colors min-h-[44px] flex items-center",
            children: "View all"
          }
        )
      ] }),
      loading ? /* @__PURE__ */ jsx(TableSkeleton, { rows: 5 }) : /* @__PURE__ */ jsx(RecentOrdersTable, { orders: analytics?.recentOrders || [] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { "aria-label": "Quick actions", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4", children: [
      /* @__PURE__ */ jsx(Link, { to: "/admin/orders", className: "block", children: /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-br from-brand-charcoal to-brand-charcoal/90 text-white rounded-2xl p-5 md:p-6 hover:shadow-warm-lg transition-all duration-300 group", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-lg", children: "Manage Orders" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mt-1", children: "View, advance, and track every order" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" }) }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Link, { to: "/admin/menu", className: "block", children: /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-br from-brand-pink to-brand-pink-dark text-white rounded-2xl p-5 md:p-6 hover:shadow-warm-lg transition-all duration-300 group", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-lg", children: "Manage Menu" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60 mt-1", children: "Add, edit, and organize menu items" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" }) }) })
      ] }) }) })
    ] }) }),
    !loading && !error && analytics && !hasData && /* @__PURE__ */ jsx("p", { className: "text-xs text-brand-charcoal/30 text-center pb-2", children: "Your analytics will populate as orders come in." })
  ] });
}
