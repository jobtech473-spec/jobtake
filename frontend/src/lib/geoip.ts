// Resolves a public IP address to a "City, Region, ZIP, Country" string for
// showing where a login session came from. This is the most detail IP-based
// geolocation can ever give — an exact street address requires GPS, which no
// website can read without the device's explicit permission.
export async function lookupGeoLocation(ip?: string | null): Promise<string | null> {
  if (!ip) return null;
  const clean = ip.trim();
  if (!clean || clean === "::1" || clean === "127.0.0.1" || clean.startsWith("192.168.") || clean.startsWith("10.") || clean.startsWith("172.")) {
    return null;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(clean)}?fields=status,city,regionName,zip,country`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "success") return null;
    return [data.city, data.regionName, data.zip, data.country].filter(Boolean).join(", ") || null;
  } catch {
    return null;
  }
}
