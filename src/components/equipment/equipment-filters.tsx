"use client";

import { useCallback, useMemo } from "react";
import { useAtom } from "jotai";
import { equipmentFiltersAtom, activeEquipmentTabAtom } from "@/store/atoms";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, Sun, Battery, Wind, Zap } from "lucide-react";
import type { EquipmentCategory, EquipmentFilters } from "@/types/equipment";
import {
  panels as panelsData,
  batteries as batteriesData,
  turbines as turbinesData,
  inverters as invertersData,
} from "@/data";

const CATEGORY_TABS = [
  { value: "panels" as const, label: "Panels", icon: Sun },
  { value: "batteries" as const, label: "Batteries", icon: Battery },
  { value: "turbines" as const, label: "Turbines", icon: Wind },
  { value: "inverters" as const, label: "Inverters", icon: Zap },
];

const SORT_OPTIONS: { value: EquipmentFilters["sortBy"]; label: string }[] = [
  { value: "rating", label: "Top Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "efficiency", label: "Efficiency" },
  { value: "wattage", label: "Wattage / Power" },
  { value: "capacity", label: "Capacity" },
];

const TECHNOLOGY_OPTIONS: Partial<Record<EquipmentCategory, { value: string; label: string }[]>> = {
  panels: [
    { value: "monocrystalline", label: "Monocrystalline" },
    { value: "polycrystalline", label: "Polycrystalline" },
    { value: "thin-film", label: "Thin Film" },
    { value: "bifacial", label: "Bifacial" },
  ],
};

/** Get unique brands for the current category */
function getBrands(category: EquipmentCategory): string[] {
  switch (category) {
    case "panels":
      return [...new Set(panelsData.map((p) => p.brand))].sort();
    case "batteries":
      return [...new Set(batteriesData.map((b) => b.brand))].sort();
    case "turbines":
      return [...new Set(turbinesData.map((t) => t.brand))].sort();
    case "inverters":
      return [...new Set(invertersData.map((i) => i.brand))].sort();
    default:
      return [];
  }
}

/** Get price range for the current category */
function getPriceRange(category: EquipmentCategory): [number, number] {
  switch (category) {
    case "panels": {
      const prices = panelsData.map((p) => p.price);
      return [Math.min(...prices), Math.max(...prices)];
    }
    case "batteries": {
      const prices = batteriesData.map((b) => b.price);
      return [Math.min(...prices), Math.max(...prices)];
    }
    case "turbines": {
      const prices = turbinesData.map((t) => t.price);
      return [Math.min(...prices), Math.max(...prices)];
    }
    case "inverters": {
      const prices = invertersData.map((i) => i.price);
      return [Math.min(...prices), Math.max(...prices)];
    }
    default:
      return [0, 10000];
  }
}

interface EquipmentFiltersProps {
  /** When true, render in a compact mode (for mobile sheet) */
  compact?: boolean;
}

export function EquipmentFilters({ compact = false }: EquipmentFiltersProps) {
  const [filters, setFilters] = useAtom(equipmentFiltersAtom);
  const [activeTab, setActiveTab] = useAtom(activeEquipmentTabAtom);

  const brands = useMemo(() => getBrands(activeTab), [activeTab]);
  const priceRange = useMemo(() => getPriceRange(activeTab), [activeTab]);

  const updateFilter = useCallback(
    <K extends keyof EquipmentFilters>(key: K, value: EquipmentFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [setFilters]
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      const cat = category as EquipmentCategory;
      setActiveTab(cat);
      const range = getPriceRange(cat);
      setFilters((prev) => ({
        ...prev,
        category: cat,
        brands: [],
        priceRange: range,
        technologyTypes: [],
        searchQuery: "",
      }));
    },
    [setActiveTab, setFilters]
  );

  const handleReset = useCallback(() => {
    const range = getPriceRange(activeTab);
    setFilters({
      category: activeTab,
      brands: [],
      priceRange: range,
      wattageRange: [200, 700],
      efficiencyRange: [0.1, 0.25],
      capacityRange: [0, 30],
      technologyTypes: [],
      sortBy: "rating",
      searchQuery: "",
    });
  }, [activeTab, setFilters]);

  const toggleBrand = useCallback(
    (brand: string) => {
      setFilters((prev) => ({
        ...prev,
        brands: prev.brands.includes(brand)
          ? prev.brands.filter((b) => b !== brand)
          : [...prev.brands, brand],
      }));
    },
    [setFilters]
  );

  const toggleTechnology = useCallback(
    (tech: string) => {
      setFilters((prev) => ({
        ...prev,
        technologyTypes: prev.technologyTypes.includes(tech)
          ? prev.technologyTypes.filter((t) => t !== tech)
          : [...prev.technologyTypes, tech],
      }));
    },
    [setFilters]
  );

  return (
    <div className={`space-y-5 ${compact ? "" : ""}`}>
      {/* Category Tabs */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Category
        </Label>
        <Tabs value={activeTab} onValueChange={handleCategoryChange}>
          <TabsList className={compact ? "w-full" : "w-full"}>
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value}>
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="equipment-search" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="equipment-search"
            placeholder="Search brand or model..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="pl-8"
            aria-label="Search equipment"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sort By
        </Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            updateFilter("sortBy", value as EquipmentFilters["sortBy"])
          }
        >
          <SelectTrigger className="w-full" aria-label="Sort equipment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Price Range
          </Label>
          <span className="text-xs text-muted-foreground">
            ${filters.priceRange[0].toLocaleString()} - $
            {filters.priceRange[1].toLocaleString()}
          </span>
        </div>
        <Slider
          min={priceRange[0]}
          max={priceRange[1]}
          step={10}
          value={filters.priceRange}
          onValueChange={(val) => {
            const arr = Array.isArray(val) ? val : [val, val];
            updateFilter("priceRange", arr as [number, number]);
          }}
          aria-label="Filter by price range"
        />
      </div>

      {/* Technology Type */}
      {activeTab === "panels" && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Technology
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {(TECHNOLOGY_OPTIONS[activeTab] ?? []).map((tech) => {
              const isActive = filters.technologyTypes.includes(tech.value);
              return (
                <button
                  key={tech.value}
                  type="button"
                  onClick={() => toggleTechnology(tech.value)}
                  aria-pressed={isActive}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tech.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Brand
        </Label>
        <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
          {brands.map((brand) => {
            const isActive = filters.brands.includes(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => toggleBrand(brand)}
                aria-pressed={isActive}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleReset}
        aria-label="Reset all filters"
      >
        <RotateCcw className="size-3.5" />
        Reset Filters
      </Button>
    </div>
  );
}
