import { Hono } from "hono";
import { z } from "zod";
import { getCached, setCache } from "../middleware/cache";
import type { OpenMeteoGeocodeResult, GeocodeResult } from "@/types/api";

const geocode = new Hono();

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const forwardSchema = z.object({
  q: z.string().min(2).max(200),
});

const reverseSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

/** Convert Open-Meteo geocode result to our normalized format */
function normalize(result: OpenMeteoGeocodeResult): GeocodeResult {
  return {
    name: result.name,
    lat: result.latitude,
    lon: result.longitude,
    country: result.country_code,
    state: result.admin1,
  };
}

geocode.get("/", async (c) => {
  const q = c.req.query("q");
  const lat = c.req.query("lat");
  const lon = c.req.query("lon");

  // Forward geocoding (address -> coordinates)
  if (q) {
    const parsed = forwardSchema.safeParse({ q });
    if (!parsed.success) {
      return c.json({ error: "Invalid query parameter (min 2 characters)" }, 400);
    }

    const key = `geocode:${parsed.data.q.toLowerCase()}`;
    const cached = getCached<GeocodeResult[]>(key, CACHE_TTL);
    if (cached) return c.json(cached);

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parsed.data.q)}&count=5&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      return c.json({ error: "Geocoding failed" }, 502);
    }

    const raw = await response.json();
    // Open-Meteo returns { results: [...] } or {} if no results
    const results: GeocodeResult[] = (raw.results ?? []).map(normalize);
    setCache(key, results);
    return c.json(results);
  }

  // Reverse geocoding (coordinates -> address)
  // Open-Meteo doesn't have a reverse geocoding endpoint,
  // so we use a nearby search with the coordinates
  if (lat && lon) {
    const parsed = reverseSchema.safeParse({ lat, lon });
    if (!parsed.success) {
      return c.json({ error: "Invalid coordinates" }, 400);
    }

    const key = `rgeocode:${parsed.data.lat.toFixed(2)}:${parsed.data.lon.toFixed(2)}`;
    const cached = getCached<GeocodeResult[]>(key, CACHE_TTL);
    if (cached) return c.json(cached);

    // Use BigDataCloud free reverse geocoding (no API key needed, generous free tier)
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${parsed.data.lat}&longitude=${parsed.data.lon}&localityLanguage=en`;
    const response = await fetch(url);
    if (!response.ok) {
      // Fallback: return coordinates as location name
      const fallback: GeocodeResult[] = [{
        name: `${parsed.data.lat.toFixed(4)}, ${parsed.data.lon.toFixed(4)}`,
        lat: parsed.data.lat,
        lon: parsed.data.lon,
        country: "",
      }];
      return c.json(fallback);
    }

    const raw = await response.json();
    const results: GeocodeResult[] = [{
      name: raw.locality || raw.city || raw.principalSubdivision || `${parsed.data.lat.toFixed(4)}, ${parsed.data.lon.toFixed(4)}`,
      lat: parsed.data.lat,
      lon: parsed.data.lon,
      country: raw.countryCode || "",
      state: raw.principalSubdivision || undefined,
    }];
    setCache(key, results);
    return c.json(results);
  }

  return c.json({ error: "Provide either 'q' for forward or 'lat'+'lon' for reverse geocoding" }, 400);
});

export default geocode;
