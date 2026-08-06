/**
 * Shared formatting helpers for the analytics dashboard.
 */

/** Format a number as Indian Rupees. */
export function formatINR(amount) {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Short currency format for axis labels — ₹1.2k, ₹3.4k, ₹12k, etc. */
export function formatCompactINR(amount) {
  const num = Number(amount || 0);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
  return `₹${Math.round(num)}`;
}

/** Full month name from a 1–12 month number. */
export function monthLabel(monthNum) {
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
    new Date(2020, Number(monthNum) - 1, 1)
  );
}

/** "31 Jul 2026" style date for recent orders. */
export function formatDay(dateStr) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

/** "2:15 PM" style time for recent orders. */
export function formatTime(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateStr));
}

