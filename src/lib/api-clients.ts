import type { SolarIrradianceData, WeatherResponse, GeocodeResult } from "@/types/api";

async function fetchJson<T>(url: string, fallbackMessage: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    let serverMessage: string | undefined;
    try {
      const body = (await res.json()) as { error?: string };
      serverMessage = body?.error;
    } catch {
      // body wasn't JSON — fall back to generic message
    }
    throw new Error(serverMessage ?? `${fallbackMessage} (HTTP ${res.status})`);
  }
  return (await res.json()) as T;
}

export function fetchSolarData(
  lat: number,
  lon: number,
): Promise<SolarIrradianceData> {
  return fetchJson(`/api/solar?lat=${lat}&lon=${lon}`, "Failed to fetch solar data");
}

export function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherResponse> {
  return fetchJson(`/api/weather?lat=${lat}&lon=${lon}`, "Failed to fetch weather data");
}

export function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  return fetchJson(`/api/geocode?q=${encodeURIComponent(query)}`, "Geocoding failed");
}

export function reverseGeocode(
  lat: number,
  lon: number,
): Promise<GeocodeResult[]> {
  return fetchJson(`/api/geocode?lat=${lat}&lon=${lon}`, "Reverse geocoding failed");
}
