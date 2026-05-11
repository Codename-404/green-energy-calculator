"use client";

import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import { locationAtom, quickStartCountryAtom } from "@/store/atoms";
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

  const handleCountryChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      setCountry(value as RegionKey);
    },
    [setCountry],
  );

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-5 text-green-600" />
          Where will you install this?
        </CardTitle>
        <CardDescription>
          We use your location to fetch real solar irradiance data — sunnier
          spots need fewer panels. Your region sets electricity rates and
          incentives for savings estimates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section aria-label="Location settings">
          <LocationInput />
        </section>

        {location && (
          <p className="text-sm text-muted-foreground">
            Detected: {location.displayName}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="country-select">Region</Label>
          <Select value={country} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-full" aria-label="Select region">
              <SelectValue placeholder="Select region" />
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
            Electricity rate: {REGIONS[country].currencySymbol}
            {REGIONS[country].defaultRate.toFixed(2)}/kWh · Incentive:{" "}
            {(REGIONS[country].taxCreditRate * 100).toFixed(0)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
