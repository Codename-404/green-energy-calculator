import { atom } from "jotai";
import type { LocationData } from "@/types/location";
import type { SolarIrradianceData, WeatherResponse } from "@/types/api";
import type { EquipmentFilters, EquipmentCategory } from "@/types/equipment";
import type { SystemConfiguration } from "@/types/calculations";
import type {
  ApplianceSelection,
  CustomAppliance,
  LoadProfile,
} from "@/types/appliance";
import type {
  QuickStartPreferences,
  SolarBundle,
} from "@/types/quick-start";
import { aggregateLoad } from "@/lib/appliance-load";
import { buildSolarBundles } from "@/lib/bundle-builder";
import { REGIONS } from "@/lib/constants";
import {
  DEFAULT_TILT_ANGLE,
  DEFAULT_AZIMUTH,
  DEFAULT_SHADING_FACTOR,
  DEFAULT_SYSTEM_LOSSES,
  DEFAULT_PANEL_COUNT,
  DEFAULT_MONTHLY_BILL,
  DEFAULT_ELECTRICITY_RATE_US,
} from "@/lib/constants";

// ============ LOCATION ============
export const locationAtom = atom<LocationData | null>(null);

// ============ API DATA ============
export const solarDataAtom = atom<SolarIrradianceData | null>(null);
export const solarLoadingAtom = atom(false);
export const weatherDataAtom = atom<WeatherResponse | null>(null);
export const weatherLoadingAtom = atom(false);

// ============ CALCULATOR INPUT MODES ============
export const solarInputModeAtom = atom<"technology" | "product">("technology");
export const windInputModeAtom = atom<"technology" | "product">("technology");

// ============ SOLAR — TECHNOLOGY MODE ============
export const solarTechnologyAtom = atom<"monocrystalline" | "polycrystalline" | "thin-film" | "bifacial">("monocrystalline");
export const solarWattageTierAtom = atom(400);

// ============ SOLAR — PRODUCT MODE ============
export const selectedPanelIdAtom = atom<string | null>(null);

// ============ SOLAR — SHARED PARAMS ============
export const panelCountAtom = atom(DEFAULT_PANEL_COUNT);
export const tiltAngleAtom = atom(DEFAULT_TILT_ANGLE);
export const azimuthAtom = atom(DEFAULT_AZIMUTH);
export const shadingFactorAtom = atom(DEFAULT_SHADING_FACTOR);
export const systemLossesAtom = atom(DEFAULT_SYSTEM_LOSSES);

// ============ WIND — TECHNOLOGY MODE ============
export const windTurbineTypeAtom = atom<"hawt" | "vawt">("hawt");
export const windPowerTierAtom = atom(5000);

// ============ WIND — PRODUCT MODE ============
export const selectedTurbineIdAtom = atom<string | null>(null);

// ============ WIND — SHARED PARAMS ============
export const turbineCountAtom = atom(1);
export const hubHeightAtom = atom(30);
export const terrainTypeAtom = atom<"open" | "suburban" | "urban" | "coastal">("suburban");

// ============ EQUIPMENT FILTERS ============
export const equipmentFiltersAtom = atom<EquipmentFilters>({
  category: "panels",
  brands: [],
  priceRange: [0, 5000],
  wattageRange: [200, 700],
  efficiencyRange: [0.10, 0.25],
  capacityRange: [0, 30],
  technologyTypes: [],
  sortBy: "rating",
  searchQuery: "",
});

// ============ COMPARISON ============
export const comparisonIdsAtom = atom<string[]>([]);

// ============ ACTIVE EQUIPMENT TAB ============
export const activeEquipmentTabAtom = atom<EquipmentCategory>("panels");

// ============ QUICK START (appliance-first flow) ============
export const applianceSelectionsAtom = atom<ApplianceSelection[]>([]);
export const customAppliancesAtom = atom<CustomAppliance[]>([]);
export const quickStartPreferencesAtom = atom<QuickStartPreferences>({
  gridMode: "grid-tied",
  backupDays: 1,
  budgetTier: "balanced",
  reserveMargin: 0.1,
});
export const quickStartCountryAtom = atom<
  import("@/lib/constants").RegionKey
>("us");

// Derived: computed load from current selections + customs
export const loadProfileAtom = atom<LoadProfile>((get) =>
  aggregateLoad(get(applianceSelectionsAtom), get(customAppliancesAtom)),
);

// Derived: computed solar bundles when inputs are ready
export const solarBundlesAtom = atom<SolarBundle[]>((get) => {
  const profile = get(loadProfileAtom);
  const solar = get(solarDataAtom);
  const location = get(locationAtom);
  const prefs = get(quickStartPreferencesAtom);
  const country = get(quickStartCountryAtom);
  if (!solar || !location || profile.annualKwh <= 0) return [];
  const rate = REGIONS[country]?.defaultRate ?? 0.16;
  return buildSolarBundles({
    profile,
    solar,
    location,
    prefs,
    country,
    electricityRate: rate,
  });
});

// ============ SYSTEM BUILDER ============
export const systemConfigAtom = atom<SystemConfiguration>({
  panelId: null,
  panelCount: DEFAULT_PANEL_COUNT,
  batteryId: null,
  batteryCount: 1,
  inverterId: null,
  turbineId: null,
  turbineCount: 0,
  monthlyElectricityBill: DEFAULT_MONTHLY_BILL,
  electricityRate: DEFAULT_ELECTRICITY_RATE_US,
  country: "us",
});
