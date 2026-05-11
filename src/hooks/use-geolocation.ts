"use client";

import { useState, useCallback } from "react";
import type { GeoCoordinates } from "@/types/location";

interface GeolocationState {
  coordinates: GeoCoordinates | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation is not supported by your browser" }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          loading: false,
          error: null,
        });
      },
      (error) => {
        let message = "Unable to retrieve your location";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied. Please enable location permissions.";
        }
        setState({ coordinates: null, loading: false, error: message });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { ...state, requestLocation };
}
