"use client";

import { useAtom, useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, Sun, Battery, Zap, Wind, DollarSign } from "lucide-react";
import type { SolarPanel, Battery as BatteryType, Inverter, WindTurbine } from "@/types/equipment";
import type { SystemConfiguration } from "@/types/calculations";

import panelsData from "@/data/solar-panels.json";
import batteriesData from "@/data/batteries.json";
import invertersData from "@/data/inverters.json";
import turbinesData from "@/data/wind-turbines.json";
import electricityRates from "@/data/electricity-rates.json";

const allPanels = panelsData as unknown as SolarPanel[];
const allBatteries = batteriesData as unknown as BatteryType[];
const allInverters = invertersData as unknown as Inverter[];
const allTurbines = turbinesData as unknown as WindTurbine[];
const rates = electricityRates as Record<
  string,
  Record<string, { state?: string; country?: string; rate: number; currency: string }>
>;

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

export function SystemConfig() {
  const [config, setConfig] = useAtom(systemConfigAtom);
  const location = useAtomValue(locationAtom);

  const regionInfo = REGIONS[config.country];

  /** Filter equipment by selected region */
  const panels = useMemo(() => allPanels.filter((p) => p.availableRegions.includes(config.country)), [config.country]);
  const batteries = useMemo(() => allBatteries.filter((b) => b.availableRegions.includes(config.country)), [config.country]);
  const inverters = useMemo(() => allInverters.filter((i) => i.availableRegions.includes(config.country)), [config.country]);
  const turbines = useMemo(() => allTurbines.filter((t) => t.availableRegions.includes(config.country)), [config.country]);

  /** Update a single field in the system configuration */
  const updateConfig = useCallback(
    <K extends keyof SystemConfiguration>(key: K, value: SystemConfiguration[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    [setConfig]
  );

  /** When location data is available, try to auto-suggest the electricity rate */
  const suggestedRate = useMemo(() => {
    if (!location) return null;
    const regionRates = rates[config.country];
    if (!regionRates) return null;

    if (location.state) {
      const stateCode = Object.keys(regionRates).find((code) => {
        const entry = regionRates[code];
        return (
          entry.state?.toLowerCase() === location.state?.toLowerCase() ||
          code.toLowerCase() === location.state?.toLowerCase()
        );
      });
      if (stateCode) return regionRates[stateCode].rate;
    }

    return null;
  }, [location, config.country]);

  /** Handle country change — reset rate and clear equipment not available in new region */
  const handleCountryChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const country = value as RegionKey;
      const defaultRate = REGIONS[country].defaultRate;
      setConfig((prev) => {
        const panelAvailable = prev.panelId && allPanels.find((p) => p.id === prev.panelId)?.availableRegions.includes(country);
        const batteryAvailable = prev.batteryId && allBatteries.find((b) => b.id === prev.batteryId)?.availableRegions.includes(country);
        const inverterAvailable = prev.inverterId && allInverters.find((i) => i.id === prev.inverterId)?.availableRegions.includes(country);
        const turbineAvailable = prev.turbineId && allTurbines.find((t) => t.id === prev.turbineId)?.availableRegions.includes(country);
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

  /** Apply suggested rate */
  const applySuggestedRate = useCallback(() => {
    if (suggestedRate) {
      updateConfig("electricityRate", suggestedRate);
    }
  }, [suggestedRate, updateConfig]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="size-5 text-green-600" />
          System Configuration
        </CardTitle>
        <CardDescription>
          Select your equipment and enter your energy details to build a custom system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Input */}
        <section aria-label="Location settings">
          <LocationInput />
        </section>

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
        </div>

        {/* Solar Panel Selection */}
        <fieldset className="space-y-3" aria-label="Solar panel configuration">
          <legend className="flex items-center gap-2 text-sm font-medium">
            <Sun className="size-4 text-yellow-500" />
            Solar Panels
          </legend>

          <div className="space-y-2">
            <Label htmlFor="panel-select">Panel Model</Label>
            <Select
              value={config.panelId ?? null}
              onValueChange={(val) => updateConfig("panelId", val || null)}
            >
              <SelectTrigger className="w-full" aria-label="Select solar panel">
                <SelectValue placeholder="Choose a solar panel" />
              </SelectTrigger>
              <SelectContent>
                {panels.map((panel) => (
                  <SelectItem key={panel.id} value={panel.id} label={`${panel.brand} ${panel.model} (${panel.wattage}W)`}>
                    {panel.brand} {panel.model} ({panel.wattage}W)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="panel-count">Number of Panels</Label>
            <Input
              id="panel-count"
              type="number"
              min={1}
              max={100}
              value={config.panelCount}
              onChange={(e) =>
                updateConfig("panelCount", Math.max(1, parseInt(e.target.value) || 1))
              }
              aria-label="Number of solar panels"
            />
          </div>
        </fieldset>

        {/* Battery Selection */}
        <fieldset className="space-y-3" aria-label="Battery configuration">
          <legend className="flex items-center gap-2 text-sm font-medium">
            <Battery className="size-4 text-blue-500" />
            Battery Storage
          </legend>

          <div className="space-y-2">
            <Label htmlFor="battery-select">Battery Model</Label>
            <Select
              value={config.batteryId ?? null}
              onValueChange={(val) => updateConfig("batteryId", val || null)}
            >
              <SelectTrigger className="w-full" aria-label="Select battery">
                <SelectValue placeholder="Choose a battery" />
              </SelectTrigger>
              <SelectContent>
                {batteries.map((bat) => (
                  <SelectItem key={bat.id} value={bat.id} label={`${bat.brand} ${bat.model} (${bat.capacityKwh} kWh)`}>
                    {bat.brand} {bat.model} ({bat.capacityKwh} kWh)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="battery-count">Number of Batteries</Label>
            <Input
              id="battery-count"
              type="number"
              min={0}
              max={20}
              value={config.batteryCount}
              onChange={(e) =>
                updateConfig("batteryCount", Math.max(0, parseInt(e.target.value) || 0))
              }
              aria-label="Number of batteries"
            />
          </div>
        </fieldset>

        {/* Inverter Selection */}
        <fieldset className="space-y-3" aria-label="Inverter configuration">
          <legend className="flex items-center gap-2 text-sm font-medium">
            <Zap className="size-4 text-orange-500" />
            Inverter
          </legend>

          <div className="space-y-2">
            <Label htmlFor="inverter-select">Inverter Model</Label>
            <Select
              value={config.inverterId ?? null}
              onValueChange={(val) => updateConfig("inverterId", val || null)}
            >
              <SelectTrigger className="w-full" aria-label="Select inverter">
                <SelectValue placeholder="Choose an inverter" />
              </SelectTrigger>
              <SelectContent>
                {inverters.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id} label={`${inv.brand} ${inv.model} (${(inv.ratedPowerW / 1000).toFixed(1)} kW, ${inv.type})`}>
                    {inv.brand} {inv.model} ({(inv.ratedPowerW / 1000).toFixed(1)} kW, {inv.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </fieldset>

        {/* Wind Turbine Selection (Optional) */}
        <fieldset className="space-y-3" aria-label="Wind turbine configuration">
          <legend className="flex items-center gap-2 text-sm font-medium">
            <Wind className="size-4 text-teal-500" />
            Wind Turbine
            <span className="text-xs text-muted-foreground">(optional)</span>
          </legend>

          <div className="space-y-2">
            <Label htmlFor="turbine-select">Turbine Model</Label>
            <Select
              value={config.turbineId ?? "none"}
              onValueChange={(val) =>
                updateConfig("turbineId", val === "none" ? null : val)
              }
            >
              <SelectTrigger className="w-full" aria-label="Select wind turbine">
                <SelectValue placeholder="None (solar only)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" label="None">None</SelectItem>
                {turbines.map((turb) => (
                  <SelectItem key={turb.id} value={turb.id} label={`${turb.brand} ${turb.model} (${(turb.ratedPowerW / 1000).toFixed(1)} kW)`}>
                    {turb.brand} {turb.model} ({(turb.ratedPowerW / 1000).toFixed(1)} kW)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {config.turbineId && (
            <div className="space-y-2">
              <Label htmlFor="turbine-count">Number of Turbines</Label>
              <Input
                id="turbine-count"
                type="number"
                min={1}
                max={10}
                value={config.turbineCount}
                onChange={(e) =>
                  updateConfig("turbineCount", Math.max(1, parseInt(e.target.value) || 1))
                }
                aria-label="Number of wind turbines"
              />
            </div>
          )}
        </fieldset>

        {/* Financial Details */}
        <fieldset className="space-y-3" aria-label="Financial details">
          <legend className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="size-4 text-green-600" />
            Financial Details
          </legend>

          <div className="space-y-2">
            <Label htmlFor="monthly-bill">
              Monthly Electricity Bill ({regionInfo.currencySymbol})
            </Label>
            <Input
              id="monthly-bill"
              type="number"
              min={0}
              step={10}
              value={config.monthlyElectricityBill}
              onChange={(e) =>
                updateConfig(
                  "monthlyElectricityBill",
                  Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              aria-label="Monthly electricity bill"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="electricity-rate">
              Electricity Rate ({regionInfo.currencySymbol}/kWh)
            </Label>
            <div className="flex gap-2">
              <Input
                id="electricity-rate"
                type="number"
                min={0}
                step={0.01}
                value={config.electricityRate}
                onChange={(e) =>
                  updateConfig(
                    "electricityRate",
                    Math.max(0, parseFloat(e.target.value) || 0)
                  )
                }
                aria-label="Electricity rate per kWh"
              />
              {suggestedRate && suggestedRate !== config.electricityRate && (
                <button
                  type="button"
                  onClick={applySuggestedRate}
                  className="shrink-0 rounded-lg bg-green-50 px-3 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
                  aria-label={`Apply suggested rate of ${regionInfo.currencySymbol}${suggestedRate.toFixed(4)} per kWh`}
                >
                  Use {regionInfo.currencySymbol}{suggestedRate.toFixed(2)}/kWh
                </button>
              )}
            </div>
            {suggestedRate && location?.state && (
              <p className="text-xs text-muted-foreground">
                Average rate for {location.state}: {regionInfo.currencySymbol}{suggestedRate.toFixed(4)}/kWh
              </p>
            )}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}
