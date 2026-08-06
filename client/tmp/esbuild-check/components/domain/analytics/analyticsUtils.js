export function formatINR(amount) {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(num);
}
export function formatCompactINR(amount) {
  const num = Number(amount || 0);
  if (num >= 1e5) return `\u20B9${(num / 1e5).toFixed(1)}L`;
  if (num >= 1e3) return `\u20B9${(num / 1e3).toFixed(1)}k`;
  return `\u20B9${Math.round(num)}`;
}
export function monthLabel(monthNum) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    new Date(2020, Number(monthNum) - 1, 1)
  );
}
export function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(dateStr));
}
export function formatTime(dateStr) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(dateStr));
}
