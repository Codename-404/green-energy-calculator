"use client";

import { useState, useCallback, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import { systemConfigAtom, locationAtom } from "@/store/atoms";
import { REGIONS } from "@/lib/constants";
import type { RegionKey } from "@/lib/constants";
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Sun,
  Battery,
  Zap,
  Wind,
  DollarSign,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import type { SystemConfiguration } from "@/types/calculations";
import {
  panels as allPanels,
  batteries as allBatteries,
  inverters as allInverters,
  turbines as allTurbines,
} from "@/data";

const REGION_GROUPS = Object.entries(REGIONS).reduce(
  (groups, [key, info]) => {
    const group = info.group;
    if (!groups[group]) groups[group] = [];
    groups[group].push(key as RegionKey);
    return groups;
  },
  {} as Record<string, RegionKey[]>
);

/** Collapsible section wrapper */
function Section({
  icon: Icon,
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-3 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-md py-1.5 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <Icon className="size-4 shrink-0 text-green-600" />
        <span className="flex-1">{title}</span>
        {open ? (
          <ChevronDown className="size-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground" />
        )}
      </button>
      {!open && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 pl-6">
          {summary}
        </p>
      )}
      {open && <div className="mt-2 space-y-3 pl-6">{children}</div>}
    </div>
  );
}

interface CompactConfigSidebarProps {
  onReconfigure: () => void;
}

export function CompactConfigSidebar({ onReconfigure }: CompactConfigSidebarProps) {
  const [config, setConfig] = useAtom(systemConfigAtom);
  const location = useAtomValue(locationAtom);
  const regionInfo = REGIONS[config.country];

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

  // Build summaries
  const selectedPanel = allPanels.find((p) => p.id === config.panelId);
  const selectedBattery = allBatteries.find((b) => b.id === config.batteryId);
  const selectedInverter = allInverters.find((i) => i.id === config.inverterId);
  const selectedTurbine = allTurbines.find((t) => t.id === config.turbineId);

  const locationSummary = location?.displayName ?? REGIONS[config.country].label;

  const equipmentParts: string[] = [];
  if (selectedPanel) equipmentParts.push(`${config.panelCount}x ${selectedPanel.brand} ${selectedPanel.model}`);
  if (selectedBattery && config.batteryCount > 0) equipmentParts.push(`${config.batteryCount}x ${selectedBattery.brand} ${selectedBattery.model}`);
  if (selectedInverter) equipmentParts.push(selectedInverter.brand + " " + selectedInverter.model);
  if (selectedTurbine && config.turbineCount > 0) equipmentParts.push(`${config.turbineCount}x ${selectedTurbine.brand} ${selectedTurbine.model}`);
  const equipmentSummary = equipmentParts.length > 0 ? equipmentParts.join(" | ") : "No equipment selected";

  const financialSummary = `${regionInfo.currencySymbol}${config.monthlyElectricityBill}/mo, ${regionInfo.currencySymbol}${config.electricityRate}/kWh`;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Configuration</h3>

      <ScrollArea className="max-h-[calc(100vh-16rem)]">
        <div className="space-y-3 pr-2">
          {/* Location Section */}
          <Section icon={MapPin} title="Location" summary={locationSummary}>
            <div className="space-y-2">
              <Label className="text-xs">Region</Label>
              <Select
                value={config.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className="h-8 text-xs" aria-label="Select region">
                  <SelectValue>{regionInfo.label}</SelectValue>
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
          </Section>

          {/* Equipment Section */}
          <Section icon={Sun} title="Equipment" summary={equipmentSummary}>
            <div className="space-y-3">
              {/* Panel */}
              <div className="space-y-1">
                <Label className="text-xs">Solar Panel</Label>
                <Select
                  value={config.panelId ?? null}
                  onValueChange={(val) => updateConfig("panelId", val || null)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choose panel" />
                  </SelectTrigger>
                  <SelectContent>
                    {panels.map((panel) => (
                      <SelectItem key={panel.id} value={panel.id} label={`${panel.brand} ${panel.model} (${panel.wattage}W)`}>
                        {panel.brand} {panel.model} ({panel.wattage}W)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={config.panelCount}
                  onChange={(e) =>
                    updateConfig("panelCount", Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="h-8 text-xs"
                  aria-label="Panel count"
                />
              </div>

              {/* Battery */}
              <div className="space-y-1">
                <Label className="text-xs">Battery</Label>
                <Select
                  value={config.batteryId ?? null}
                  onValueChange={(val) => updateConfig("batteryId", val || null)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choose battery" />
                  </SelectTrigger>
                  <SelectContent>
                    {batteries.map((bat) => (
                      <SelectItem key={bat.id} value={bat.id} label={`${bat.brand} ${bat.model} (${bat.capacityKwh} kWh)`}>
                        {bat.brand} {bat.model} ({bat.capacityKwh} kWh)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={config.batteryCount}
                  onChange={(e) =>
                    updateConfig("batteryCount", Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="h-8 text-xs"
                  aria-label="Battery count"
                />
              </div>

              {/* Inverter */}
              <div className="space-y-1">
                <Label className="text-xs">Inverter</Label>
                <Select
                  value={config.inverterId ?? null}
                  onValueChange={(val) => updateConfig("inverterId", val || null)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choose inverter" />
                  </SelectTrigger>
                  <SelectContent>
                    {inverters.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id} label={`${inv.brand} ${inv.model} (${(inv.ratedPowerW / 1000).toFixed(1)} kW)`}>
                        {inv.brand} {inv.model} ({(inv.ratedPowerW / 1000).toFixed(1)} kW)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Turbine */}
              <div className="space-y-1">
                <Label className="text-xs">Wind Turbine</Label>
                <Select
                  value={config.turbineId ?? "none"}
                  onValueChange={(val) =>
                    updateConfig("turbineId", val === "none" ? null : val)
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="None" />
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
                {config.turbineId && (
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={config.turbineCount}
                    onChange={(e) =>
                      updateConfig("turbineCount", Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="h-8 text-xs"
                    aria-label="Turbine count"
                  />
                )}
              </div>
            </div>
          </Section>

          {/* Financial Section */}
          <Section icon={DollarSign} title="Financial" summary={financialSummary}>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Monthly Bill ({regionInfo.currencySymbol})</Label>
                <Input
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
                  className="h-8 text-xs"
                  aria-label="Monthly bill"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rate ({regionInfo.currencySymbol}/kWh)</Label>
                <Input
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
                  className="h-8 text-xs"
                  aria-label="Electricity rate"
                />
              </div>
            </div>
          </Section>
        </div>
      </ScrollArea>

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={onReconfigure}
      >
        <RotateCcw className="size-3.5" />
        Reconfigure System
      </Button>
    </div>
  );
}
