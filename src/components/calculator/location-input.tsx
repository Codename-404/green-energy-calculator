"use client";

import { useState, useCallback, useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  locationAtom,
  solarDataAtom,
  solarLoadingAtom,
  weatherDataAtom,
  weatherLoadingAtom,
} from "@/store/atoms";
import { useGeolocation } from "@/hooks/use-geolocation";
import {
  geocodeAddress,
  reverseGeocode,
  fetchSolarData,
  fetchWeather,
} from "@/lib/api-clients";
import type { GeocodeResult } from "@/types/api";
import type { LocationData } from "@/types/location";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Loader2, X, LocateIcon } from "lucide-react";

export function LocationInput() {
  const [location, setLocation] = useAtom(locationAtom);
  const setSolarData = useSetAtom(solarDataAtom);
  const setSolarLoading = useSetAtom(solarLoadingAtom);
  const setWeatherData = useSetAtom(weatherDataAtom);
  const setWeatherLoading = useSetAtom(weatherLoadingAtom);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    loading: gpsLoading,
    error: gpsError,
    requestLocation,
    coordinates: gpsCoordinates,
  } = useGeolocation();

  /** Fetch solar and weather data for the given coordinates */
  const fetchLocationData = useCallback(
    async (lat: number, lon: number) => {
      setSolarLoading(true);
      setWeatherLoading(true);

      try {
        const [solar, weather] = await Promise.allSettled([
          fetchSolarData(lat, lon),
          fetchWeather(lat, lon),
        ]);

        if (solar.status === "fulfilled") {
          setSolarData(solar.value);
        }
        if (weather.status === "fulfilled") {
          setWeatherData(weather.value);
        }
      } catch {
        // Individual errors handled by allSettled
      } finally {
        setSolarLoading(false);
        setWeatherLoading(false);
      }
    },
    [setSolarData, setSolarLoading, setWeatherData, setWeatherLoading],
  );

  /** Select a geocode result and store it */
  const handleSelectResult = useCallback(
    async (result: GeocodeResult) => {
      const locationData: LocationData = {
        coordinates: {
          latitude: result.lat,
          longitude: result.lon,
        },
        displayName: [result.name, result.state, result.country]
          .filter(Boolean)
          .join(", "),
        country: result.country,
        state: result.state,
      };

      setLocation(locationData);
      setShowResults(false);
      setResults([]);
      setQuery("");
      setError(null);

      await fetchLocationData(result.lat, result.lon);
    },
    [setLocation, fetchLocationData],
  );

  /** Handle address search */
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const geocodeResults = await geocodeAddress(query.trim());
      if (geocodeResults.length === 0) {
        setError("No results found. Try a different search term.");
        setShowResults(false);
      } else {
        setResults(geocodeResults);
        setShowResults(true);
      }
    } catch {
      setError("Failed to search location. Please try again.");
    } finally {
      setSearching(false);
    }
  }, [query]);

  /** Handle GPS location request */
  const handleGps = useCallback(async () => {
    requestLocation();
  }, [requestLocation]);

  /** Effect-like handler: once GPS coordinates arrive, reverse geocode */
  const handleGpsResult = useCallback(async () => {
    if (!gpsCoordinates) return;

    setError(null);
    try {
      const geocodeResults = await reverseGeocode(
        gpsCoordinates.latitude,
        gpsCoordinates.longitude,
      );

      if (geocodeResults.length > 0) {
        await handleSelectResult(geocodeResults[0]);
      } else {
        // Use coordinates directly without a name
        const locationData: LocationData = {
          coordinates: gpsCoordinates,
          displayName: `${gpsCoordinates.latitude.toFixed(4)}, ${gpsCoordinates.longitude.toFixed(4)}`,
          country: "",
        };
        setLocation(locationData);
        await fetchLocationData(
          gpsCoordinates.latitude,
          gpsCoordinates.longitude,
        );
      }
    } catch {
      setError("Failed to determine your location name.");
      // Still use coordinates
      const locationData: LocationData = {
        coordinates: gpsCoordinates,
        displayName: `${gpsCoordinates.latitude.toFixed(4)}, ${gpsCoordinates.longitude.toFixed(4)}`,
        country: "",
      };
      setLocation(locationData);
      await fetchLocationData(
        gpsCoordinates.latitude,
        gpsCoordinates.longitude,
      );
    }
  }, [gpsCoordinates, handleSelectResult, setLocation, fetchLocationData]);

  useEffect(() => {
    if (!gpsCoordinates) return;
    handleGpsResult();
  }, [gpsCoordinates, handleGpsResult]);

  /** Handle clearing the selected location */
  const handleClear = useCallback(() => {
    setLocation(null);
    setSolarData(null);
    setWeatherData(null);
    setQuery("");
    setResults([]);
    setShowResults(false);
    setError(null);
  }, [setLocation, setSolarData, setWeatherData]);

  /** Handle form submission on Enter key */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
      if (e.key === "Escape") {
        setShowResults(false);
      }
    },
    [handleSearch],
  );

  return (
    <div className="space-y-3">
      <Label htmlFor="location-search">Location</Label>

      {/* Current location display */}
      {location && (
        <Card size="sm">
          <CardContent className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-green-600" />
            <span className="flex-1 truncate text-sm font-medium">
              {location.displayName}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleClear}
              aria-label="Clear location"
            >
              <X className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          {searching ? (
            <Loader2 className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            id="location-search"
            type="text"
            placeholder="City, address, or postcode — press Enter"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (showResults) setShowResults(false);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Search for a location"
            aria-autocomplete="list"
            aria-expanded={showResults}
            disabled={searching}
            className="pl-9"
          />
        </div>

        <Button
          variant="outline"
          size="default"
          onClick={handleGps}
          disabled={gpsLoading}
          aria-label="Use my current location"
          className="gap-2"
        >
          {gpsLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LocateIcon className="size-4" />
          )}
          <span className="hidden sm:inline">Use my location</span>
        </Button>
      </div>

      {/* Error messages */}
      {(error || gpsError) && (
        <p className="text-sm text-destructive" role="alert">
          {error || gpsError}
        </p>
      )}

      {/* Geocode results dropdown */}
      {showResults && results.length > 0 && (
        <Card size="sm">
          <CardContent className="p-0">
            <ul
              className="divide-y divide-border"
              role="listbox"
              aria-label="Location search results"
            >
              {results.map((result, index) => {
                const label = [result.name, result.state, result.country]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <li key={`${result.lat}-${result.lon}-${index}`}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                      onClick={() => handleSelectResult(result)}
                      role="option"
                      aria-selected={false}
                    >
                      <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{label}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {result.lat.toFixed(2)}, {result.lon.toFixed(2)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
