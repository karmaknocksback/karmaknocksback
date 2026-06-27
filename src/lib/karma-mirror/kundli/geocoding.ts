/**
 * Geocodes a birth-place name to latitude/longitude via Nominatim
 * (OpenStreetMap's free, no-API-key geocoder).
 *
 * IMPORTANT — cannot be tested in the sandbox this was built in: that
 * environment's network access is restricted to package registries
 * (npm/pypi/github), not general internet, so this function has been
 * written carefully against Nominatim's documented API contract but has
 * NOT been exercised against a live network call. Verify this works in
 * your actual deployment environment before relying on it, and check
 * Nominatim's usage policy (https://operations.osmfoundation.org/policies/nominatim/)
 * for rate limits and required attribution if used at any real volume —
 * a production app should set a real, identifying User-Agent (required
 * by Nominatim's policy) and consider a paid geocoder for high traffic.
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export async function geocodePlace(placeName: string): Promise<GeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(placeName)}`;

  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim's usage policy requires a real, identifying User-Agent.
        // Replace with your actual app name/contact before production use.
        "User-Agent": "KarmaKnocksBack/1.0 (contact: connect@karmaknocksback.com)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error("[geocoding] Nominatim request failed:", res.status);
      return null;
    }

    const results = await res.json();
    if (!Array.isArray(results) || !results.length) return null;

    const top = results[0];
    return {
      latitude: parseFloat(top.lat),
      longitude: parseFloat(top.lon),
      displayName: top.display_name,
    };
  } catch (err) {
    console.error("[geocoding] error:", err);
    return null;
  }
}
