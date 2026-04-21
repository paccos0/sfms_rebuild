export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number, currency = "RWF") {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(parsedDate);
}

export function formatDateTime(date: string | Date | null | undefined) {
  if (!date) return "-";
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsedDate);
}

export function generatePaymentReference(prefix = "PAY") {
  const now = new Date();
  const parts = [
    prefix,
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
    Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  ];

  return parts.join("-");
}
