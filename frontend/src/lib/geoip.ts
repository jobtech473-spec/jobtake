// Resolves a public IP address to an approximate "City, Country" string for
// showing where a login session came from. Browsers never expose the actual
// device name or precise location to a website, so this is IP-based and
// approximate — the closest a server can get.
export async function lookupGeoLocation(ip?: string | null): Promise<string | null> {
  if (!ip) return null;
  const clean = ip.trim();
  if (!clean || clean === "::1" || clean === "127.0.0.1" || clean.startsWith("192.168.") || clean.startsWith("10.") || clean.startsWith("172.")) {
    return null;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(clean)}?fields=status,city,country`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "success") return null;
    return [data.city, data.country].filter(Boolean).join(", ") || null;
  } catch {
    return null;
  }
}
