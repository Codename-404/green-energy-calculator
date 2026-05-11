"use client";

import { useAtom, useAtomValue } from "jotai";
import {
  selectedTurbineIdAtom,
  hubHeightAtom,
  terrainTypeAtom,
  turbineCountAtom,
  windInputModeAtom,
  windTurbineTypeAtom,
  windPowerTierAtom,
} from "@/store/atoms";
import { selectedTurbineAtom } from "@/store/derived";
import windTurbines from "@/data/wind-turbines.json";
import type { WindTurbine } from "@/types/equipment";
import { WIND_TECHNOLOGY_SPECS } from "@/lib/technology-specs";
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
import {
  formatPower,
  formatCurrency,
  formatWindSpeed,
  formatArea,
} from "@/lib/formatters";
import {
  Wind,
  Gauge,
  MountainSnow,
  Building2,
  Trees,
  Waves,
  Layers,
  Package,
} from "lucide-react";

const turbines = windTurbines as unknown as WindTurbine[];

const TERRAIN_OPTIONS = [
  {
    value: "open" as const,
    label: "Open",
    description: "Flat fields, farmland",
    icon: MountainSnow,
  },
  {
    value: "suburban" as const,
    label: "Suburban",
    description: "Houses, low buildings",
    icon: Trees,
  },
  {
    value: "urban" as const,
    label: "Urban",
    description: "Dense city, tall buildings",
    icon: Building2,
  },
  {
    value: "coastal" as const,
    label: "Coastal",
    description: "Near ocean, low friction",
    icon: Waves,
  },
];

/** Turbine type selector (HAWT / VAWT) */
function TurbineTypeSelector({
  selected,
  onSelect,
}: {
  selected: "hawt" | "vawt";
  onSelect: (key: "hawt" | "vawt") => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Turbine Type</Label>
      <div className="grid grid-cols-2 gap-3">
        {WIND_TECHNOLOGY_SPECS.map((spec) => {
          const isSelected = selected === spec.key;
          return (
            <button
              key={spec.key}
              type="button"
              onClick={() => onSelect(spec.key)}
              aria-pressed={isSelected}
              className={`group rounded-lg border p-3 text-left text-sm transition-all duration-200 ${
                isSelected
                  ? "border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-500/30 dark:border-sky-400 dark:bg-sky-950/40"
                  : "border-border hover:border-sky-400/30 hover:bg-muted/60 hover:shadow-sm"
              }`}
            >
              <p
                className={`font-semibold ${
                  isSelected
                    ? "text-sky-700 dark:text-sky-300"
                    : "text-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400"
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
                  className="bg-blue-100/80 text-[10px] font-normal text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                >
                  ~{formatCurrency(spec.pricePerWatt)}/W
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-amber-100/80 text-[10px] font-normal text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                >
                  {spec.warrantyYears}-yr warranty
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Power tier button group */
function PowerTierSelector({
  options,
  selected,
  onSelect,
}: {
  options: { watts: number }[];
  selected: number;
  onSelect: (w: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Rated Power</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Button
            key={opt.watts}
            variant={selected === opt.watts ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(opt.watts)}
            aria-pressed={selected === opt.watts}
          >
            {formatPower(opt.watts)}
          </Button>
        ))}
      </div>
    </div>
  );
}

/** Example products for the selected turbine type */
function ExampleTurbines({ type }: { type: "hawt" | "vawt" }) {
  const examples = turbines.filter((t) => t.type === type).slice(0, 4);

  if (examples.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Example products using this technology
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {examples.map((turbine) => (
          <div
            key={turbine.id}
            className="group flex items-center gap-2 rounded-md border border-dashed p-2 text-xs transition-colors hover:border-sky-400/30 hover:bg-muted/40"
          >
            <Wind className="size-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-sky-500/60" />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {turbine.brand} {turbine.model}
              </p>
              <p className="text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
                {formatPower(turbine.ratedPowerW)} | {turbine.rotorDiameter}m
                rotor | {formatCurrency(turbine.price)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Product dropdown grouped by turbine type */
function ProductSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="turbine-select">Select a Product</Label>
      <Select value={selectedId} onValueChange={onSelect}>
        <SelectTrigger className="w-full" aria-label="Select a wind turbine">
          <SelectValue placeholder="Choose a turbine..." />
        </SelectTrigger>
        <SelectContent>
          {WIND_TECHNOLOGY_SPECS.map((group, idx) => {
            const groupTurbines = turbines.filter(
              (t) => t.type === group.key
            );
            if (groupTurbines.length === 0) return null;
            return (
              <SelectGroup key={group.key}>
                {idx > 0 && <SelectSeparator />}
                <SelectLabel>
                  {group.label}
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    — {group.description}
                  </span>
                </SelectLabel>
                {groupTurbines.map((turbine) => (
                  <SelectItem key={turbine.id} value={turbine.id} label={`${turbine.brand} ${turbine.model} (${formatPower(turbine.ratedPowerW)})`}>
                    {turbine.brand} {turbine.model} (
                    {formatPower(turbine.ratedPowerW)})
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

export function WindParametersForm() {
  const [windInputMode, setWindInputMode] = useAtom(windInputModeAtom);
  const [windTurbineType, setWindTurbineType] = useAtom(windTurbineTypeAtom);
  const [windPowerTier, setWindPowerTier] = useAtom(windPowerTierAtom);
  const [selectedTurbineId, setSelectedTurbineId] =
    useAtom(selectedTurbineIdAtom);
  const [hubHeight, setHubHeight] = useAtom(hubHeightAtom);
  const [terrainType, setTerrainType] = useAtom(terrainTypeAtom);
  const [turbineCount, setTurbineCount] = useAtom(turbineCountAtom);
  const selectedTurbine = useAtomValue(selectedTurbineAtom);

  const currentSpec = WIND_TECHNOLOGY_SPECS.find(
    (s) => s.key === windTurbineType
  );

  /** When turbine type changes, ensure power tier is valid */
  const handleTypeChange = (key: "hawt" | "vawt") => {
    setWindTurbineType(key);
    const spec = WIND_TECHNOLOGY_SPECS.find((s) => s.key === key);
    if (spec && !spec.powerOptions.find((p) => p.watts === windPowerTier)) {
      setWindPowerTier(spec.powerOptions[0].watts);
    }
    // Reset hub height if not in new type's options
    if (spec && !spec.hubHeightOptions.includes(hubHeight)) {
      setHubHeight(spec.hubHeightOptions[0]);
    }
  };

  /** When a product turbine is selected, ensure hub height is valid */
  const handleProductChange = (id: string | null) => {
    setSelectedTurbineId(id);
    const turbine = turbines.find((t) => t.id === id);
    if (turbine && !turbine.hubHeightOptions.includes(hubHeight)) {
      setHubHeight(turbine.hubHeightOptions[0]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Mode Tabs */}
      <Tabs
        value={windInputMode}
        onValueChange={(val) =>
          setWindInputMode(val as "technology" | "product")
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
            <TurbineTypeSelector
              selected={windTurbineType}
              onSelect={handleTypeChange}
            />

            {currentSpec && (
              <PowerTierSelector
                options={currentSpec.powerOptions}
                selected={windPowerTier}
                onSelect={setWindPowerTier}
              />
            )}

            {/* Technology specs card */}
            {currentSpec && (
              <Card
                size="sm"
                className="border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/30"
              >
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm text-sky-700 dark:text-sky-400">
                    <Wind className="size-4" />
                    {currentSpec.label} — {formatPower(windPowerTier)}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Generic specs for this turbine type |{" "}
                    {currentSpec.warrantyYears}-year typical warranty
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Rated Power</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPower(windPowerTier)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Rotor Dia.</p>
                      <p className="text-sm font-semibold text-foreground">
                        {currentSpec.powerOptions.find(
                          (p) => p.watts === windPowerTier
                        )?.rotorDiameter ?? "—"}
                        m
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Est. Price</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(
                          windPowerTier * currentSpec.pricePerWatt
                        )}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Cut-in</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatWindSpeed(currentSpec.cutInSpeed)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Rated Speed</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatWindSpeed(currentSpec.ratedSpeed)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Cut-out</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatWindSpeed(currentSpec.cutOutSpeed)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <ExampleTurbines type={windTurbineType} />
          </div>
        </TabsContent>

        {/* Product Mode */}
        <TabsContent value="product">
          <div className="space-y-5 pt-4">
            <ProductSelector
              selectedId={selectedTurbineId}
              onSelect={handleProductChange}
            />

            {/* Selected product specs */}
            {windInputMode === "product" && selectedTurbine && (
              <Card
                size="sm"
                className="border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/30"
              >
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm text-sky-700 dark:text-sky-400">
                    <Wind className="size-4" />
                    {selectedTurbine.brand} {selectedTurbine.model}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {selectedTurbine.type === "hawt"
                      ? "Horizontal Axis"
                      : "Vertical Axis"}{" "}
                    | {selectedTurbine.warrantyYears}-year warranty
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Rated Power</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPower(selectedTurbine.ratedPowerW)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Rotor Dia.</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedTurbine.rotorDiameter}m
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Price</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(selectedTurbine.price)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Cut-in</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatWindSpeed(selectedTurbine.cutInSpeed)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Rated</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatWindSpeed(selectedTurbine.ratedSpeed)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground/50 text-[10px] font-medium uppercase tracking-wide">Swept Area</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatArea(selectedTurbine.sweptArea)}
                      </p>
                    </div>
                  </div>
                  {selectedTurbine.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {selectedTurbine.tags.slice(0, 4).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== SHARED PARAMETERS ===== */}

      {/* Hub Height */}
      {selectedTurbine && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Hub Height</Label>
            <span className="text-sm font-medium text-muted-foreground">
              {hubHeight}m
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTurbine.hubHeightOptions.map((height) => (
              <Button
                key={height}
                variant={hubHeight === height ? "default" : "outline"}
                size="sm"
                onClick={() => setHubHeight(height)}
                aria-label={`Set hub height to ${height} meters`}
                aria-pressed={hubHeight === height}
              >
                {height}m
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Higher hubs reach stronger, more consistent winds
          </p>
        </div>
      )}

      {/* Terrain Type */}
      <div className="space-y-2">
        <Label>Terrain Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {TERRAIN_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = terrainType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTerrainType(option.value)}
                aria-pressed={isSelected}
                className={`group flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition-all duration-200 ${
                  isSelected
                    ? "border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-500/30 dark:border-sky-400 dark:bg-sky-950/40"
                    : "border-border hover:border-sky-400/30 hover:bg-muted/60 hover:shadow-sm"
                }`}
              >
                <Icon
                  className={`size-4 shrink-0 transition-colors ${
                    isSelected
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-muted-foreground/60 group-hover:text-sky-500/60"
                  }`}
                />
                <div>
                  <p
                    className={`font-semibold ${
                      isSelected
                        ? "text-sky-700 dark:text-sky-300"
                        : "text-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400"
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-xs text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Turbine Count */}
      <div className="space-y-2">
        <Label htmlFor="turbine-count">Number of Turbines</Label>
        <Input
          id="turbine-count"
          type="number"
          min={1}
          max={20}
          value={turbineCount}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 1 && val <= 20) {
              setTurbineCount(val);
            }
          }}
          aria-label="Number of wind turbines"
        />
      </div>

      {/* System summary */}
      {selectedTurbine && (
        <Card size="sm">
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Gauge className="size-4 text-sky-600" />
              <span className="text-muted-foreground">Total capacity:</span>
              <span className="font-medium">
                {formatPower(selectedTurbine.ratedPowerW * turbineCount)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
