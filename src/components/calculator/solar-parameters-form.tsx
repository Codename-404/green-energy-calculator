"use client";

import { useAtom, useAtomValue } from "jotai";
import {
  selectedPanelIdAtom,
  panelCountAtom,
  tiltAngleAtom,
  azimuthAtom,
  shadingFactorAtom,
  systemLossesAtom,
  solarInputModeAtom,
  solarTechnologyAtom,
  solarWattageTierAtom,
} from "@/store/atoms";
import { selectedPanelAtom } from "@/store/derived";
import solarPanels from "@/data/solar-panels.json";
import type { SolarPanel } from "@/types/equipment";
import { SOLAR_TECHNOLOGY_SPECS } from "@/lib/technology-specs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatPercent, formatPower, formatCurrency } from "@/lib/formatters";
import { Zap, Sun, Layers, Package } from "lucide-react";

const panels = solarPanels as unknown as SolarPanel[];

/** Extract a single number from the slider's onValueChange callback */
function sliderValue(val: number | readonly number[]): number {
  if (typeof val === "number") return val;
  return val[0];
}

/** Compass direction label for a given azimuth degree */
function getCompassLabel(deg: number): string {
  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

/** Technology type selector card grid */
function TechnologySelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Technology Type</Label>
      <div className="grid grid-cols-2 gap-3">
        {SOLAR_TECHNOLOGY_SPECS.map((spec) => {
          const isSelected = selected === spec.key;
          return (
            <button
              key={spec.key}
              type="button"
              onClick={() => onSelect(spec.key)}
              aria-pressed={isSelected}
              className={`group rounded-lg border p-3 text-left text-sm transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30 dark:bg-primary/10"
                  : "border-border hover:border-primary/30 hover:bg-muted/60 hover:shadow-sm"
              }`}
            >
              <p
                className={`font-semibold ${
                  isSelected
                    ? "text-primary"
                    : "text-foreground group-hover:text-primary/80"
                }`}
              >
                {spec.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
                {spec.description}
              </p>
              <div className="mt-2 flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100/80 text-[10px] font-normal text-green-700 dark:bg-green-900/40 dark:text-green-300"
                >
                  {formatPercent(spec.efficiency)} eff.
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100/80 text-[10px] font-normal text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                >
                  ~{formatCurrency(spec.pricePerWatt)}/W
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Wattage tier button group */
function WattageTierSelector({
  options,
  selected,
  onSelect,
}: {
  options: number[];
  selected: number;
  onSelect: (w: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Panel Wattage</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((w) => (
          <Button
            key={w}
            variant={selected === w ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(w)}
            aria-pressed={selected === w}
          >
            {w}W
          </Button>
        ))}
      </div>
    </div>
  );
}

/** Example products for the selected technology */
function ExampleProducts({ technology }: { technology: string }) {
  const examples = panels
    .filter((p) => p.technology === technology)
    .slice(0, 4);

  if (examples.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Example products using this technology
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {examples.map((panel) => (
          <div
            key={panel.id}
            className="group flex items-center gap-2 rounded-md border border-dashed p-2 text-xs transition-colors hover:border-primary/30 hover:bg-muted/40"
          >
            <Sun className="size-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary/60" />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {panel.brand} {panel.model}
              </p>
              <p className="text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
                {panel.wattage}W | {formatPercent(panel.efficiency)} |{" "}
                {formatCurrency(panel.price)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Product dropdown grouped by technology type */
function ProductSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="panel-select">Select a Product</Label>
      <Select
        value={selectedId}
        onValueChange={onSelect}
      >
        <SelectTrigger className="w-full" aria-label="Select a solar panel">
          <SelectValue placeholder="Choose a panel..." />
        </SelectTrigger>
        <SelectContent>
          {SOLAR_TECHNOLOGY_SPECS.map((group, idx) => {
            const groupPanels = panels.filter(
              (p) => p.technology === group.key
            );
            if (groupPanels.length === 0) return null;
            return (
              <SelectGroup key={group.key}>
                {idx > 0 && <SelectSeparator />}
                <SelectLabel>
                  {group.label}
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    — {group.description}
                  </span>
                </SelectLabel>
                {groupPanels.map((panel) => (
                  <SelectItem key={panel.id} value={panel.id} label={`${panel.brand} ${panel.model} (${panel.wattage}W)`}>
                    {panel.brand} {panel.model} ({panel.wattage}W)
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SolarParametersForm() {
  const [solarInputMode, setSolarInputMode] = useAtom(solarInputModeAtom);
  const [solarTechnology, setSolarTechnology] = useAtom(solarTechnologyAtom);
  const [solarWattageTier, setSolarWattageTier] = useAtom(solarWattageTierAtom);
  const [selectedPanelId, setSelectedPanelId] = useAtom(selectedPanelIdAtom);
  const [panelCount, setPanelCount] = useAtom(panelCountAtom);
  const [tiltAngle, setTiltAngle] = useAtom(tiltAngleAtom);
  const [azimuth, setAzimuth] = useAtom(azimuthAtom);
  const [shadingFactor, setShadingFactor] = useAtom(shadingFactorAtom);
  const [systemLosses, setSystemLosses] = useAtom(systemLossesAtom);
  const selectedPanel = useAtomValue(selectedPanelAtom);

  const currentSpec = SOLAR_TECHNOLOGY_SPECS.find(
    (s) => s.key === solarTechnology
  );

  /** When technology changes, ensure wattage is valid for new technology */
  const handleTechnologyChange = (key: string) => {
    setSolarTechnology(key as typeof solarTechnology);
    const spec = SOLAR_TECHNOLOGY_SPECS.find((s) => s.key === key);
    if (spec && !spec.wattageOptions.includes(solarWattageTier)) {
      setSolarWattageTier(spec.wattageOptions[0]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Mode Tabs */}
      <Tabs
        value={solarInputMode}
        onValueChange={(val) =>
          setSolarInputMode(val as "technology" | "product")
        }
      >
        <TabsList className="w-full">
          <TabsTrigger value="technology" className="flex-1 gap-1.5">
            <Layers className="size-3.5" />
            By Technology
          </TabsTrigger>
          <TabsTrigger value="product" className="flex-1 gap-1.5">
            <Package className="size-3.5" />
            By Product
          </TabsTrigger>
        </TabsList>

        {/* Technology Mode */}
        <TabsContent value="technology">
          <div className="space-y-5 pt-4">
            <TechnologySelector
              selected={solarTechnology}
              onSelect={handleTechnologyChange}
            />

            {currentSpec && (
              <WattageTierSelector
                options={currentSpec.wattageOptions}
                selected={solarWattageTier}
                onSelect={setSolarWattageTier}
              />
            )}

            {/* Technology specs card */}
            {currentSpec && (
              <Card
                size="sm"
                className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
              >
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                    <Sun className="size-4" />
                    {currentSpec.label} — {solarWattageTier}W
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Generic specs for this technology type |{" "}
                    {currentSpec.warrantyYears}-year typical warranty
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Power</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPower(solarWattageTier)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Efficiency</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPercent(currentSpec.efficiency)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Est. Price</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(
                          solarWattageTier * currentSpec.pricePerWatt
                        )}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Temp. Coeff</p>
                      <p className="text-sm font-semibold text-foreground">
                        {currentSpec.temperatureCoefficient}%/°C
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">25-yr Output</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPercent(currentSpec.performanceWarrantyYear25)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Price/W</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(currentSpec.pricePerWatt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <ExampleProducts technology={solarTechnology} />
          </div>
        </TabsContent>

        {/* Product Mode */}
        <TabsContent value="product">
          <div className="space-y-5 pt-4">
            <ProductSelector
              selectedId={selectedPanelId}
              onSelect={setSelectedPanelId}
            />

            {/* Selected product specs */}
            {solarInputMode === "product" && selectedPanel && (
              <Card
                size="sm"
                className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
              >
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                    <Sun className="size-4" />
                    {selectedPanel.brand} {selectedPanel.model}
                  </CardTitle>
                  <CardDescription className="text-xs capitalize">
                    {selectedPanel.technology} technology |{" "}
                    {selectedPanel.warrantyYears}-year warranty
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Power</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPower(selectedPanel.wattage)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Efficiency</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPercent(selectedPanel.efficiency)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Price</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(selectedPanel.price)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== SHARED PARAMETERS ===== */}

      {/* Panel Count */}
      <div className="space-y-2">
        <Label htmlFor="panel-count">Number of Panels</Label>
        <Input
          id="panel-count"
          type="number"
          min={1}
          max={100}
          value={panelCount}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 1 && val <= 100) {
              setPanelCount(val);
            }
          }}
          aria-label="Number of solar panels"
        />
      </div>

      {/* Tilt Angle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Tilt Angle</Label>
          <span className="text-sm font-medium text-muted-foreground">
            {tiltAngle}°
          </span>
        </div>
        <Slider
          min={0}
          max={90}
          step={1}
          value={[tiltAngle]}
          onValueChange={(val) => setTiltAngle(sliderValue(val))}
          aria-label="Panel tilt angle in degrees"
        />
        <p className="text-xs text-muted-foreground">
          0° = flat, 90° = vertical
        </p>
      </div>

      {/* Azimuth */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Azimuth (Orientation)</Label>
          <span className="text-sm font-medium text-muted-foreground">
            {azimuth}° ({getCompassLabel(azimuth)})
          </span>
        </div>
        <Slider
          min={0}
          max={360}
          step={1}
          value={[azimuth]}
          onValueChange={(val) => setAzimuth(sliderValue(val))}
          aria-label="Panel azimuth orientation"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>N (0°)</span>
          <span>E (90°)</span>
          <span>S (180°)</span>
          <span>W (270°)</span>
          <span>N (360°)</span>
        </div>
      </div>

      {/* Shading Factor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Shading Factor</Label>
          <span className="text-sm font-medium text-muted-foreground">
            {((1 - shadingFactor) * 100).toFixed(0)}% shaded
          </span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[Math.round((1 - shadingFactor) * 100)]}
          onValueChange={(val) =>
            setShadingFactor(1 - sliderValue(val) / 100)
          }
          aria-label="Percentage of shading on panels"
        />
        <p className="text-xs text-muted-foreground">
          0% = no shade, 100% = fully shaded
        </p>
      </div>

      {/* System Losses */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>System Losses</Label>
          <span className="text-sm font-medium text-muted-foreground">
            {(systemLosses * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          min={0}
          max={50}
          step={1}
          value={[Math.round(systemLosses * 100)]}
          onValueChange={(val) =>
            setSystemLosses(sliderValue(val) / 100)
          }
          aria-label="System losses percentage"
        />
        <p className="text-xs text-muted-foreground">
          Includes wiring, inverter, soiling, and other losses (14% typical)
        </p>
      </div>

      {/* System summary */}
      {selectedPanel && (
        <Card size="sm">
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="size-4 text-green-600" />
              <span className="text-muted-foreground">System capacity:</span>
              <span className="font-medium">
                {formatPower(selectedPanel.wattage * panelCount)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
