import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { coordinatesSchema } from "@/lib/validators";
import { getCached, setCache, cacheKey } from "../middleware/cache";
import type { OpenMeteoWeatherResponse, WeatherResponse } from "@/types/api";

const weather = new Hono();

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/** Map WMO weather code to a human-readable description */
function wmoCodeToDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] ?? "Unknown";
}

weather.get("/", zValidator("query", coordinatesSchema), async (c) => {
  const { lat, lon } = c.req.valid("query");

  const key = cacheKey("weather", lat, lon);
  const cached = getCached<WeatherResponse>(key, CACHE_TTL);
  if (cached) {
    return c.json(cached);
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=ms`;

  const response = await fetch(url);
  if (!response.ok) {
    return c.json({ error: "Failed to fetch weather data" }, 502);
  }

  const raw: OpenMeteoWeatherResponse = await response.json();

  const data: WeatherResponse = {
    temperature: raw.current.temperature_2m,
    feelsLike: raw.current.apparent_temperature,
    humidity: raw.current.relative_humidity_2m,
    cloudCover: raw.current.cloud_cover,
    windSpeed: raw.current.wind_speed_10m,
    windDirection: raw.current.wind_direction_10m,
    windGusts: raw.current.wind_gusts_10m,
    weatherCode: raw.current.weather_code,
    weatherDescription: wmoCodeToDescription(raw.current.weather_code),
  };

  setCache(key, data);
  return c.json(data);
});

export default weather;
