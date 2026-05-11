// NASA POWER Climatology API Response
export interface NasaPowerResponse {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number, number]; // [lng, lat, elevation]
  };
  properties: {
    parameter: {
      ALLSKY_SFC_SW_DWN: Record<string, number>; // Monthly irradiance kWh/m²/day
      CLRSKY_SFC_SW_DWN: Record<string, number>; // Clear sky irradiance
      T2M: Record<string, number>; // Temperature °C
      T2M_MAX: Record<string, number>;
      T2M_MIN: Record<string, number>;
      WS2M: Record<string, number>; // Wind speed m/s (2m height)
    };
  };
}

// Normalized solar data used internally
export interface SolarIrradianceData {
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  monthly: {
    month: string; // "JAN", "FEB", etc.
    irradiance: number; // kWh/m²/day (all-sky)
    clearSkyIrradiance: number;
    temperature: number; // °C average
    temperatureMax: number;
    temperatureMin: number;
    windSpeed: number; // m/s at 2m height
  }[];
  annual: {
    irradiance: number;
    temperature: number;
    windSpeed: number;
  };
}

// Open-Meteo Current Weather Response
export interface OpenMeteoWeatherResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    cloud_cover: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
}

// Normalized weather data used in the app
export interface WeatherResponse {
  temperature: number; // °C
  feelsLike: number;
  humidity: number; // %
  cloudCover: number; // %
  windSpeed: number; // m/s
  windDirection: number; // degrees
  windGusts: number; // m/s
  weatherCode: number; // WMO code
  weatherDescription: string;
  locationName?: string;
}

// Open-Meteo Geocoding Response
export interface OpenMeteoGeocodeResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  country_code: string;
  country: string;
  admin1?: string; // state/region
  admin2?: string;
  timezone: string;
  population?: number;
}

// Normalized geocode result used in the app
export interface GeocodeResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}
