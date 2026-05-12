"use client";

import { useCallback } from "react";
import { useSetAtom } from "jotai";
import {
  locationAtom,
  solarDataAtom,
  solarLoadingAtom,
  weatherDataAtom,
  weatherLoadingAtom,
} from "@/store/atoms";
import {
  reverseGeocode,
  fetchSolarData,
  fetchWeather,
} from "@/lib/api-clients";
import type { LocationData } from "@/types/location";

/**
 * Sets a location from raw lat/lng coordinates: reverse-geocodes for a
 * display name, then kicks off the same solar + weather fetch chain
 * LocationInput uses for search / GPS results.
 *
 * Wired by the map's click-to-pin handler.
 */
export function usePickLocation() {
  const setLocation = useSetAtom(locationAtom);
  const setSolarData = useSetAtom(solarDataAtom);
  const setSolarLoading = useSetAtom(solarLoadingAtom);
  const setWeatherData = useSetAtom(weatherDataAtom);
  const setWeatherLoading = useSetAtom(weatherLoadingAtom);

  return useCallback(
    async (lat: number, lng: number) => {
      let displayName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      let country = "";
      let state: string | undefined;

      try {
        const results = await reverseGeocode(lat, lng);
        if (results.length > 0) {
          const r = results[0];
          displayName = [r.name, r.state, r.country].filter(Boolean).join(", ");
          country = r.country;
          state = r.state;
        }
      } catch {
        // fall back to raw coords
      }

      const data: LocationData = {
        coordinates: { latitude: lat, longitude: lng },
        displayName,
        country,
        state,
      };
      setLocation(data);

      setSolarLoading(true);
      setWeatherLoading(true);
      try {
        const [solar, weather] = await Promise.allSettled([
          fetchSolarData(lat, lng),
          fetchWeather(lat, lng),
        ]);
        if (solar.status === "fulfilled") setSolarData(solar.value);
        if (weather.status === "fulfilled") setWeatherData(weather.value);
      } finally {
        setSolarLoading(false);
        setWeatherLoading(false);
      }
    },
    [
      setLocation,
      setSolarData,
      setSolarLoading,
      setWeatherData,
      setWeatherLoading,
    ],
  );
}
