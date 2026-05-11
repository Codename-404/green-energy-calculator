import type { SolarIrradianceData, WeatherResponse, GeocodeResult } from "@/types/api";

export async function fetchSolarData(
  lat: number,
  lon: number
): Promise<SolarIrradianceData> {
  const res = await fetch(`/api/solar?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Failed to fetch solar data");
  return res.json();
}

export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherResponse> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Failed to fetch weather data");
  return res.json();
}

export async function geocodeAddress(
  query: string
): Promise<GeocodeResult[]> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Geocoding failed");
  return res.json();
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<GeocodeResult[]> {
  const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Reverse geocoding failed");
  return res.json();
}
