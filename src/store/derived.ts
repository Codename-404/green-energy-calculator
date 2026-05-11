import { atom } from "jotai";
import {
  solarDataAtom,
  selectedPanelIdAtom,
  panelCountAtom,
  tiltAngleAtom,
  azimuthAtom,
  shadingFactorAtom,
  systemLossesAtom,
  selectedTurbineIdAtom,
  hubHeightAtom,
  terrainTypeAtom,
  locationAtom,
  equipmentFiltersAtom,
  comparisonIdsAtom,
  solarInputModeAtom,
  solarTechnologyAtom,
  solarWattageTierAtom,
  windInputModeAtom,
  windTurbineTypeAtom,
  windPowerTierAtom,
} from "./atoms";
import {
  createVirtualPanel,
  createVirtualTurbine,
} from "@/lib/technology-specs";
import { calculateSolarProduction } from "@/lib/solar-calculations";
import { calculateWindProduction } from "@/lib/wind-calculations";
import { calculateEnvironmentalImpact } from "@/lib/environmental-impact";
import type {
  SolarCalculationResult,
  WindCalculationResult,
  EnvironmentalImpact,
} from "@/types/calculations";
import { panels, batteries, turbines, inverters } from "@/data";

// Equipment lookup helpers
export const allPanelsAtom = atom(() => panels);
export const allBatteriesAtom = atom(() => batteries);
export const allTurbinesAtom = atom(() => turbines);
export const allInvertersAtom = atom(() => inverters);

// Selected panel object (supports both technology and product modes)
export const selectedPanelAtom = atom((get) => {
  const mode = get(solarInputModeAtom);

  if (mode === "product") {
    const id = get(selectedPanelIdAtom);
    if (!id) return null;
    return panels.find((p) => p.id === id) ?? null;
  }

  // Technology mode — create virtual panel from generic specs
  const tech = get(solarTechnologyAtom);
  const wattage = get(solarWattageTierAtom);
  return createVirtualPanel(tech, wattage);
});

// Selected turbine object (supports both technology and product modes)
export const selectedTurbineAtom = atom((get) => {
  const mode = get(windInputModeAtom);

  if (mode === "product") {
    const id = get(selectedTurbineIdAtom);
    if (!id) return null;
    return turbines.find((t) => t.id === id) ?? null;
  }

  // Technology mode — create virtual turbine from generic specs
  const type = get(windTurbineTypeAtom);
  const power = get(windPowerTierAtom);
  return createVirtualTurbine(type, power);
});

// Solar calculation result
export const solarResultAtom = atom<SolarCalculationResult | null>((get) => {
  const solarData = get(solarDataAtom);
  const panel = get(selectedPanelAtom);
  const location = get(locationAtom);
  if (!solarData || !panel || !location) return null;

  return calculateSolarProduction(
    {
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      panelWattage: panel.wattage,
      panelEfficiency: panel.efficiency,
      panelCount: get(panelCountAtom),
      tiltAngle: get(tiltAngleAtom),
      azimuth: get(azimuthAtom),
      shadingFactor: get(shadingFactorAtom),
      systemLosses: get(systemLossesAtom),
      temperatureCoefficient: panel.temperatureCoefficient,
    },
    solarData
  );
});

// Wind calculation result
export const windResultAtom = atom<WindCalculationResult | null>((get) => {
  const weather = get(solarDataAtom);
  const turbine = get(selectedTurbineAtom);
  const location = get(locationAtom);
  if (!weather || !turbine || !location) return null;

  return calculateWindProduction(
    {
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      turbineRatedPower: turbine.ratedPowerW,
      rotorDiameter: turbine.rotorDiameter,
      hubHeight: get(hubHeightAtom),
      cutInSpeed: turbine.cutInSpeed,
      ratedSpeed: turbine.ratedSpeed,
      cutOutSpeed: turbine.cutOutSpeed,
      terrainType: get(terrainTypeAtom),
    },
    weather
  );
});

// ============ ENVIRONMENTAL IMPACT ============

// Environmental impact (combined solar + wind)
export const environmentalImpactAtom = atom<EnvironmentalImpact | null>(
  (get) => {
    const solarResult = get(solarResultAtom);
    const windResult = get(windResultAtom);
    const totalProduction =
      (solarResult?.annualProduction ?? 0) +
      (windResult?.annualProduction ?? 0);
    if (totalProduction === 0) return null;
    return calculateEnvironmentalImpact(totalProduction);
  }
);

// ============ EQUIPMENT FILTERING ============

interface BrandedItem {
  brand: string;
  model: string;
  price: number;
  rating: number;
}

function applySearchAndBrand<T extends BrandedItem>(
  items: T[],
  searchQuery: string,
  brands: string[]
): T[] {
  let result = items;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      (item) =>
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q)
    );
  }
  if (brands.length > 0) {
    result = result.filter((item) => brands.includes(item.brand));
  }
  return result;
}

function applyPriceFilter<T extends { price: number }>(
  items: T[],
  range: readonly [number, number]
): T[] {
  return items.filter((i) => i.price >= range[0] && i.price <= range[1]);
}

// Filtered solar panels
export const filteredPanelsAtom = atom((get) => {
  const filters = get(equipmentFiltersAtom);
  let result = applySearchAndBrand([...panels], filters.searchQuery, filters.brands);

  if (filters.technologyTypes.length > 0) {
    result = result.filter((p) => filters.technologyTypes.includes(p.technology));
  }
  result = applyPriceFilter(result, filters.priceRange);
  result = result.filter(
    (p) => p.wattage >= filters.wattageRange[0] && p.wattage <= filters.wattageRange[1]
  );
  result = result.filter(
    (p) =>
      p.efficiency >= filters.efficiencyRange[0] &&
      p.efficiency <= filters.efficiencyRange[1]
  );

  switch (filters.sortBy) {
    case "price-asc":
      return result.sort((a, b) => a.price - b.price);
    case "price-desc":
      return result.sort((a, b) => b.price - a.price);
    case "efficiency":
      return result.sort((a, b) => b.efficiency - a.efficiency);
    case "wattage":
      return result.sort((a, b) => b.wattage - a.wattage);
    case "rating":
      return result.sort((a, b) => b.rating - a.rating);
    default:
      return result;
  }
});

// Filtered batteries
export const filteredBatteriesAtom = atom((get) => {
  const filters = get(equipmentFiltersAtom);
  let result = applySearchAndBrand([...batteries], filters.searchQuery, filters.brands);
  result = applyPriceFilter(result, filters.priceRange);
  result = result.filter(
    (b) =>
      b.capacityKwh >= filters.capacityRange[0] &&
      b.capacityKwh <= filters.capacityRange[1]
  );

  switch (filters.sortBy) {
    case "price-asc":
      return result.sort((a, b) => a.price - b.price);
    case "price-desc":
      return result.sort((a, b) => b.price - a.price);
    case "capacity":
      return result.sort((a, b) => b.capacityKwh - a.capacityKwh);
    case "rating":
      return result.sort((a, b) => b.rating - a.rating);
    default:
      return result;
  }
});

// Filtered turbines
export const filteredTurbinesAtom = atom((get) => {
  const filters = get(equipmentFiltersAtom);
  let result = applySearchAndBrand([...turbines], filters.searchQuery, filters.brands);
  result = applyPriceFilter(result, filters.priceRange);

  switch (filters.sortBy) {
    case "price-asc":
      return result.sort((a, b) => a.price - b.price);
    case "price-desc":
      return result.sort((a, b) => b.price - a.price);
    case "wattage":
      return result.sort((a, b) => b.ratedPowerW - a.ratedPowerW);
    case "rating":
      return result.sort((a, b) => b.rating - a.rating);
    default:
      return result;
  }
});

// Filtered inverters
export const filteredInvertersAtom = atom((get) => {
  const filters = get(equipmentFiltersAtom);
  let result = applySearchAndBrand([...inverters], filters.searchQuery, filters.brands);
  result = applyPriceFilter(result, filters.priceRange);

  switch (filters.sortBy) {
    case "price-asc":
      return result.sort((a, b) => a.price - b.price);
    case "price-desc":
      return result.sort((a, b) => b.price - a.price);
    case "efficiency":
      return result.sort((a, b) => b.efficiency - a.efficiency);
    case "wattage":
      return result.sort((a, b) => b.ratedPowerW - a.ratedPowerW);
    case "rating":
      return result.sort((a, b) => b.rating - a.rating);
    default:
      return result;
  }
});

// Comparison items
export const comparisonItemsAtom = atom((get) => {
  const ids = get(comparisonIdsAtom);
  const allItems = [...panels, ...batteries, ...turbines, ...inverters];
  return ids
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean);
});
