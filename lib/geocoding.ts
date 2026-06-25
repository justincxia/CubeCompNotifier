interface GeoResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Geocodes a city/state/country into coordinates using OpenStreetMap Nominatim.
 * Free, no API key required. Rate limit: 1 req/sec (acceptable for registration flow).
 */
export async function geocodeLocation(
  city: string,
  state: string,
  country: string
): Promise<GeoResult> {
  const parts = [city, state, country].filter(Boolean);
  const query = encodeURIComponent(parts.join(", "));

  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      // Nominatim requires a descriptive User-Agent
      "User-Agent": "CubeCompNotifier/1.0 (https://github.com/cube-comp-notifier)",
    },
    // 8s timeout — server-side only
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Geocoding request failed: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      `Could not find coordinates for "${parts.join(", ")}". ` +
        "Please check your city and country and try again."
    );
  }

  const result = data[0];

  return {
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    displayName: result.display_name,
  };
}
