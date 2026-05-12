"use client";

import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, MousePointerClick } from "lucide-react";
import { locationAtom, quickStartCountryAtom } from "@/store/atoms";
import { REGIONS } from "@/lib/constants";
import type { RegionKey } from "@/lib/constants";
import { LocationInput } from "@/components/calculator/location-input";
import { usePickLocation } from "@/hooks/use-pick-location";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const LocationMap = dynamic(
  () =>
    import("@/components/calculator/location-map").then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-lg border bg-muted" />
    ),
  },
);

const REGION_GROUPS = Object.entries(REGIONS).reduce(
  (groups, [key, info]) => {
    const group = info.group;
    if (!groups[group]) groups[group] = [];
    groups[group].push(key as RegionKey);
    return groups;
  },
  {} as Record<string, RegionKey[]>,
);

export function StepLocation() {
  const location = useAtomValue(locationAtom);
  const [country, setCountry] = useAtom(quickStartCountryAtom);
  const pickLocation = usePickLocation();

  const handleCountryChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      setCountry(value as RegionKey);
    },
    [setCountry],
  );

  const region = REGIONS[country];

  const centerLat = location?.coordinates.latitude ?? region.centerLat;
  const centerLng = location?.coordinates.longitude ?? region.centerLng;
  const zoom = location ? 11 : region.centerZoom;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <MapPin className="size-5 text-green-600" />
          Where will you install this?
        </h2>
        <p className="text-sm text-muted-foreground">
          We pull sun data for your spot and use the region for electricity
          rates and incentives.
        </p>
      </header>

      <section aria-label="Location search">
        <LocationInput />
      </section>

      <div className="space-y-2">
        <LocationMap
          lat={location?.coordinates.latitude ?? null}
          lng={location?.coordinates.longitude ?? null}
          centerLat={centerLat}
          centerLng={centerLng}
          zoom={zoom}
          label={location?.displayName}
          onPick={pickLocation}
        />
        {!location && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MousePointerClick className="size-3.5" />
            Click anywhere on the map to drop a pin.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country-select">Region</Label>
        <Select value={country} onValueChange={handleCountryChange}>
          <SelectTrigger
            id="country-select"
            className="w-full"
            aria-label="Select region"
          >
            <SelectValue placeholder="Select region">{region.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REGION_GROUPS).map(
              ([groupName, keys], groupIdx) => (
                <SelectGroup key={groupName}>
                  {groupIdx > 0 && <SelectSeparator />}
                  <SelectLabel>{groupName}</SelectLabel>
                  {keys.map((key) => (
                    <SelectItem
                      key={key}
                      value={key}
                      label={REGIONS[key].label}
                    >
                      {REGIONS[key].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ),
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Rate: {region.currencySymbol}
          {region.defaultRate.toFixed(2)}/kWh
          {region.taxCreditRate > 0 &&
            ` · Tax credit: ${(region.taxCreditRate * 100).toFixed(0)}%`}
        </p>
      </div>
    </div>
  );
}
