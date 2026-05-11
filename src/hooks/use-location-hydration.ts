"use client";

import { useEffect, useRef } from "react";
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
 * When the URL contains lat/lng, reconstruct the full location and fetch
 * solar/weather data — mirroring the flow in LocationInput.
 *
 * Only fires once after `isHydrated` becomes true.
 */
export function useLocationHydration(
  urlLat: number | null,
  urlLng: number | null,
  isHydrated: boolean
) {
  const setLocation = useSetAtom(locationAtom);
  const setSolarData = useSetAtom(solarDataAtom);
  const setSolarLoading = useSetAtom(solarLoadingAtom);
  const setWeatherData = useSetAtom(weatherDataAtom);
  const setWeatherLoading = useSetAtom(weatherLoadingAtom);
  const didRunRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || didRunRef.current) return;
    if (urlLat === null || urlLng === null) return;
    didRunRef.current = true;

    const lat = urlLat;
    const lng = urlLng;

    async function hydrate() {
      // 1. Set a temporary location so the UI shows coordinates immediately
      const fallbackName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setLocation({
        coordinates: { latitude: lat, longitude: lng },
        displayName: fallbackName,
        country: "",
      });

      // 2. Reverse geocode + fetch data in parallel
      setSolarLoading(true);
      setWeatherLoading(true);

      const [geoResult, solarResult, weatherResult] =
        await Promise.allSettled([
          reverseGeocode(lat, lng),
          fetchSolarData(lat, lng),
          fetchWeather(lat, lng),
        ]);

      // 3. Update location with proper display name
      if (geoResult.status === "fulfilled" && geoResult.value.length > 0) {
        const r = geoResult.value[0];
        const locationData: LocationData = {
          coordinates: { latitude: lat, longitude: lng },
          displayName: [r.name, r.state, r.country]
            .filter(Boolean)
            .join(", "),
          country: r.country,
          state: r.state,
        };
        setLocation(locationData);
      }

      // 4. Set solar & weather data
      if (solarResult.status === "fulfilled") {
        setSolarData(solarResult.value);
      }
      if (weatherResult.status === "fulfilled") {
        setWeatherData(weatherResult.value);
      }

      setSolarLoading(false);
      setWeatherLoading(false);
    }

    hydrate();
  }, [
    isHydrated,
    urlLat,
    urlLng,
    setLocation,
    setSolarData,
    setSolarLoading,
    setWeatherData,
    setWeatherLoading,
  ]);
}
