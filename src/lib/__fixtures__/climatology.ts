import type { SolarIrradianceData } from "@/types/api";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
] as const;

export function makeClimatology(opts: {
  latitude: number;
  longitude: number;
  elevation?: number;
  irradiance?: number; // kWh/m²/day, used as flat monthly value
  temperature?: number; // °C
  windSpeed?: number; // m/s at 2m
}): SolarIrradianceData {
  const {
    latitude,
    longitude,
    elevation = 100,
    irradiance = 5,
    temperature = 20,
    windSpeed = 5,
  } = opts;

  return {
    location: { latitude, longitude, elevation },
    monthly: MONTHS.map((m) => ({
      month: m,
      irradiance,
      clearSkyIrradiance: irradiance * 1.1,
      temperature,
      temperatureMax: temperature + 5,
      temperatureMin: temperature - 5,
      windSpeed,
    })),
    annual: {
      irradiance,
      temperature,
      windSpeed,
    },
  };
}
