"use client";

import { useAtomValue } from "jotai";
import { weatherDataAtom, weatherLoadingAtom } from "@/store/atoms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTemperature, formatWindSpeed } from "@/lib/formatters";
import {
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
} from "lucide-react";

/** Map WMO weather code to a Lucide icon */
function getWeatherIcon(code: number) {
  if (code === 0 || code === 1) return Sun;
  if (code === 2 || code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

/** Skeleton loading state */
function WeatherSkeleton() {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-4" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function WeatherDisplay() {
  const weather = useAtomValue(weatherDataAtom);
  const loading = useAtomValue(weatherLoadingAtom);

  if (loading) {
    return <WeatherSkeleton />;
  }

  if (!weather) {
    return null;
  }

  const WeatherIcon = getWeatherIcon(weather.weatherCode);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <WeatherIcon className="size-4 text-blue-500" />
          Current Weather
          {weather.locationName && (
            <span className="text-muted-foreground">in {weather.locationName}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main condition */}
        <p className="mb-3 text-sm capitalize text-muted-foreground">
          {weather.weatherDescription}
        </p>

        {/* Weather metrics grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="flex items-center gap-2">
            <Thermometer className="size-4 shrink-0 text-red-500/70" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">Temperature</p>
              <p className="text-sm font-semibold">
                {formatTemperature(weather.temperature)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Cloud className="size-4 shrink-0 text-gray-400/70" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">Cloud Cover</p>
              <p className="text-sm font-semibold">{weather.cloudCover}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="size-4 shrink-0 text-teal-500/70" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">Wind Speed</p>
              <p className="text-sm font-semibold">
                {formatWindSpeed(weather.windSpeed)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="size-4 shrink-0 text-blue-400/70" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">Humidity</p>
              <p className="text-sm font-semibold">{weather.humidity}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
