"use client";

import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import { systemConfigAtom, locationAtom } from "@/store/atoms";
import { REGIONS } from "@/lib/constants";
import type { RegionKey } from "@/lib/constants";
import { LocationInput } from "@/components/calculator/location-input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { MapPin } from "lucide-react";

import {
  panels as allPanels,
  batteries as allBatteries,
  inverters as allInverters,
  turbines as allTurbines,
} from "@/data";

/** Group region keys by their group label */
const REGION_GROUPS = Object.entries(REGIONS).reduce(
  (groups, [key, info]) => {
    const group = info.group;
    if (!groups[group]) groups[group] = [];
    groups[group].push(key as RegionKey);
    return groups;
  },
  {} as Record<string, RegionKey[]>
);

export function StepLocation() {
  const [config, setConfig] = useAtom(systemConfigAtom);
  const location = useAtomValue(locationAtom);

  const handleCountryChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const country = value as RegionKey;
      const defaultRate = REGIONS[country].defaultRate;
      setConfig((prev) => {
        const panelAvailable =
          prev.panelId &&
          allPanels.find((p) => p.id === prev.panelId)?.availableRegions.includes(country);
        const batteryAvailable =
          prev.batteryId &&
          allBatteries.find((b) => b.id === prev.batteryId)?.availableRegions.includes(country);
        const inverterAvailable =
          prev.inverterId &&
          allInverters.find((i) => i.id === prev.inverterId)?.availableRegions.includes(country);
        const turbineAvailable =
          prev.turbineId &&
          allTurbines.find((t) => t.id === prev.turbineId)?.availableRegions.includes(country);
        return {
          ...prev,
          country,
          electricityRate: defaultRate,
          panelId: panelAvailable ? prev.panelId : null,
          batteryId: batteryAvailable ? prev.batteryId : null,
          inverterId: inverterAvailable ? prev.inverterId : null,
          turbineId: turbineAvailable ? prev.turbineId : null,
        };
      });
    },
    [setConfig]
  );

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-5 text-green-600" />
          Where is your installation?
        </CardTitle>
        <CardDescription>
          Enter your address or use geolocation to get accurate solar and wind data for your area.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Input */}
        <section aria-label="Location settings">
          <LocationInput />
        </section>

        {location && (
          <p className="text-sm text-muted-foreground">
            Detected: {location.displayName}
          </p>
        )}

        {/* Region Selector */}
        <div className="space-y-2">
          <Label htmlFor="country-select">Region</Label>
          <Select
            value={config.country}
            onValueChange={handleCountryChange}
          >
            <SelectTrigger className="w-full" aria-label="Select region">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REGION_GROUPS).map(([groupName, keys], groupIdx) => (
                <SelectGroup key={groupName}>
                  {groupIdx > 0 && <SelectSeparator />}
                  <SelectLabel>{groupName}</SelectLabel>
                  {keys.map((key) => (
                    <SelectItem key={key} value={key} label={REGIONS[key].label}>
                      {REGIONS[key].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Currency: {REGIONS[config.country].currencySymbol} ({REGIONS[config.country].currency})
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
