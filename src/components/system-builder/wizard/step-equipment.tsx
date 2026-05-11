"use client";

import { useAtom } from "jotai";
import { useCallback, useMemo } from "react";
import { systemConfigAtom } from "@/store/atoms";
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
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sun, Battery, Zap, Wind, Wrench } from "lucide-react";
import type { SolarPanel, Battery as BatteryType, Inverter, WindTurbine } from "@/types/equipment";
import type { SystemConfiguration } from "@/types/calculations";

import panelsData from "@/data/solar-panels.json";
import batteriesData from "@/data/batteries.json";
import invertersData from "@/data/inverters.json";
import turbinesData from "@/data/wind-turbines.json";

const allPanels = panelsData as unknown as SolarPanel[];
const allBatteries = batteriesData as unknown as BatteryType[];
const allInverters = invertersData as unknown as Inverter[];
const allTurbines = turbinesData as unknown as WindTurbine[];

export function StepEquipment() {
  const [config, setConfig] = useAtom(systemConfigAtom);

  const panels = useMemo(
    () => allPanels.filter((p) => p.availableRegions.includes(config.country)),
    [config.country]
  );
  const batteries = useMemo(
    () => allBatteries.filter((b) => b.availableRegions.includes(config.country)),
    [config.country]
  );
  const inverters = useMemo(
    () => allInverters.filter((i) => i.availableRegions.includes(config.country)),
    [config.country]
  );
  const turbines = useMemo(
    () => allTurbines.filter((t) => t.availableRegions.includes(config.country)),
    [config.country]
  );

  const updateConfig = useCallback(
    <K extends keyof SystemConfiguration>(key: K, value: SystemConfiguration[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    [setConfig]
  );

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="size-5 text-green-600" />
          Select Your Equipment
        </CardTitle>
        <CardDescription>
          Choose solar panels, battery storage, an inverter, and optionally a wind turbine.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Solar Panels */}
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

          {/* Battery Storage */}
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

          {/* Inverter */}
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

          {/* Wind Turbine (Optional) */}
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
        </div>
      </CardContent>
    </Card>
  );
}
