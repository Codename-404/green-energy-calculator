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
import type { SolarPanel, Battery, WindTurbine, Inverter } from "@/types/equipment";

// These will be populated with imported JSON data
// Using dynamic imports to avoid issues with JSON imports in some configs
let panelsData: SolarPanel[] = [];
let batteriesData: Battery[] = [];
let turbinesData: WindTurbine[] = [];
let invertersData: Inverter[] = [];

// Initialize equipment data
export async function initEquipmentData() {
  const [panels, batteries, turbines, inverters] = await Promise.all([
    import("@/data/solar-panels.json").then((m) => m.default as unknown as SolarPanel[]),
    import("@/data/batteries.json").then((m) => m.default as unknown as Battery[]),
    import("@/data/wind-turbines.json").then((m) => m.default as unknown as WindTurbine[]),
    import("@/data/inverters.json").then((m) => m.default as unknown as Inverter[]),
  ]);
  panelsData = panels;
  batteriesData = batteries;
  turbinesData = turbines;
  invertersData = inverters;
}

// Equipment lookup helpers
export const allPanelsAtom = atom(() => panelsData);
export const allBatteriesAtom = atom(() => batteriesData);
export const allTurbinesAtom = atom(() => turbinesData);
export const allInvertersAtom = atom(() => invertersData);

// Selected panel object (supports both technology and product modes)
export const selectedPanelAtom = atom((get) => {
  const mode = get(solarInputModeAtom);

  if (mode === "product") {
    const id = get(selectedPanelIdAtom);
    if (!id) return null;
    return panelsData.find((p) => p.id === id) ?? null;
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
    return turbinesData.find((t) => t.id === id) ?? null;
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
  const solarData = get(solarDataAtom);
  const turbine = get(selectedTurbineAtom);
  const location = get(locationAtom);
  if (!solarData || !turbine || !location) return null;

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
    solarData
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

// Filtered equipment lists
export const filteredPanelsAtom = atom((get) => {
  const filters = get(equipmentFiltersAtom);
  let panels = [...panelsData];

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    panels = panels.filter(
      (p) =>
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q)
    );
  }
  if (filters.brands.length > 0) {
    panels = panels.filter((p) => filters.brands.includes(p.brand));
  }
  if (filters.technologyTypes.length > 0) {
    panels = panels.filter((p) =>
      filters.technologyTypes.includes(p.technology)
    );
  }
  panels = panels.filter(
    (p) =>
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
  );
  panels = panels.filter(
    (p) =>
      p.wattage >= filters.wattageRange[0] &&
      p.wattage <= filters.wattageRange[1]
  );
  panels = panels.filter(
    (p) =>
      p.efficiency >= filters.efficiencyRange[0] &&
      p.efficiency <= filters.efficiencyRange[1]
  );

  switch (filters.sortBy) {
    case "price-asc":
      panels.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      panels.sort((a, b) => b.price - a.price);
      break;
    case "efficiency":
      panels.sort((a, b) => b.efficiency - a.efficiency);
      break;
    case "wattage":
      panels.sort((a, b) => b.wattage - a.wattage);
      break;
    case "rating":
      panels.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  return panels;
});

export const filteredBatteriesAtom = atom((get) => {
  const filters = get(equipmentFiltersAtom);
  let batteries = [...batteriesData];

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    batteries = batteries.filter(
      (b) =>
        b.brand.toLowerCase().includes(q) ||
        b.model.toLowerCase().includes(q)
    );
  }
  if (filters.brands.length > 0) {
    batteries = batteries.filter((b) => filters.brands.includes(b.brand));
  }
  batteries = batteries.filter(
    (b) =>
      b.price >= filters.priceRange[0] && b.price <= filters.priceRange[1]
  );
  batteries = batteries.filter(
    (b) =>
      b.capacityKwh >= filters.capacityRange[0] &&
      b.capacityKwh <= filters.capacityRange[1]
  );

  switch (filters.sortBy) {
    case "price-asc":
      batteries.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      batteries.sort((a, b) => b.price - a.price);
      break;
    case "capacity":
      batteries.sort((a, b) => b.capacityKwh - a.capacityKwh);
      break;
    case "rating":
      batteries.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  return batteries;
});

// Filtered turbines
export const filteredTurbinesAtom = atom((get) => {
  const filters = get(equipmentFiltersAtom);
  let turbines = [...turbinesData];

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    turbines = turbines.filter(
      (t) =>
        t.brand.toLowerCase().includes(q) ||
        t.model.toLowerCase().includes(q)
    );
  }
  if (filters.brands.length > 0) {
    turbines = turbines.filter((t) => filters.brands.includes(t.brand));
  }
  turbines = turbines.filter(
    (t) =>
      t.price >= filters.priceRange[0] && t.price <= filters.priceRange[1]
  );

  switch (filters.sortBy) {
    case "price-asc":
      turbines.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      turbines.sort((a, b) => b.price - a.price);
      break;
    case "wattage":
      turbines.sort((a, b) => b.ratedPowerW - a.ratedPowerW);
      break;
    case "rating":
      turbines.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  return turbines;
});

// Filtered inverters
export const filteredInvertersAtom = atom((get) => {
  const filters = get(equipmentFiltersAtom);
  let inverters = [...invertersData];

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    inverters = inverters.filter(
      (inv) =>
        inv.brand.toLowerCase().includes(q) ||
        inv.model.toLowerCase().includes(q)
    );
  }
  if (filters.brands.length > 0) {
    inverters = inverters.filter((inv) => filters.brands.includes(inv.brand));
  }
  inverters = inverters.filter(
    (inv) =>
      inv.price >= filters.priceRange[0] && inv.price <= filters.priceRange[1]
  );

  switch (filters.sortBy) {
    case "price-asc":
      inverters.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      inverters.sort((a, b) => b.price - a.price);
      break;
    case "efficiency":
      inverters.sort((a, b) => b.efficiency - a.efficiency);
      break;
    case "wattage":
      inverters.sort((a, b) => b.ratedPowerW - a.ratedPowerW);
      break;
    case "rating":
      inverters.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  return inverters;
});

// Comparison items
export const comparisonItemsAtom = atom((get) => {
  const ids = get(comparisonIdsAtom);
  const allItems = [
    ...panelsData,
    ...batteriesData,
    ...turbinesData,
    ...invertersData,
  ];
  return ids
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean);
});
