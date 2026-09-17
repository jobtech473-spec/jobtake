import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatSalary(min?: number | null, max?: number | null, currency = "USD", period = "year") {
  if (!min && !max) return "Competitive";
  const fmt = (n: number) => {
    if (n >= 10000000) return `${+(n / 10000000).toFixed(2)}Cr`;
    if (n >= 100000) return `${+(n / 100000).toFixed(2)}L`;
    if (n >= 1000) return `${+(n / 1000).toFixed(1)}k`;
    return `${n}`;
  };
  const sym = "₹";
  const suffix = period === "year" ? "" : `/${period}`;
  if (min && max) return `${sym}${fmt(min)} – ${sym}${fmt(max)}${suffix}`;
  if (min) return `${sym}${fmt(min)}+${suffix}`;
  return `Up to ${sym}${fmt(max!)}${suffix}`;
}

export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
