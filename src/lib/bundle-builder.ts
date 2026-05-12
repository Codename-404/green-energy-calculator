import {
  panels as PANELS,
  inverters as INVERTERS,
  batteries as BATTERIES,
} from "@/data";
import type { SolarPanel, Inverter, Battery } from "@/types/equipment";
import type { LocationData } from "@/types/location";
import type { SolarIrradianceData } from "@/types/api";
import type { LoadProfile } from "@/types/appliance";
import type {
  QuickStartPreferences,
  SolarBundle,
  BudgetTier,
} from "@/types/quick-start";
import { sizeSolarArray } from "./solar-sizing";
import { calculateROI } from "./roi-calculations";
import { calculateEnvironmentalImpact } from "./environmental-impact";
import type { RegionKey } from "./constants";

const TIER_LABEL: Record<BudgetTier, string> = {
  budget: "Budget",
  balanced: "Balanced",
  premium: "Premium",
};

/**
 * Pick one panel per tier so that **system cost is monotonic**
 * (budget ≤ balanced ≤ premium). Sort all candidates by $/W ascending —
 * since target kWh and insolation are constant across tiers, total panel
 * cost is proportional to $/W, so this ordering carries through to the
 * full system cost. Then take the cheapest, the median, and the priciest.
 *
 * Earlier heuristic (cheapest / highest-rated / highest-efficiency) could
 * pick a premium-brand monocrystalline as "balanced" that actually cost
 * more than the bifacial picked as "premium" — confusing for users.
 */
function pickPanelsByTier(country: RegionKey): Record<BudgetTier, SolarPanel | null> {
  const inRegion = PANELS.filter((p) => p.availableRegions.includes(country));
  const pool = inRegion.length > 0 ? inRegion : [...PANELS];

  if (pool.length === 0) {
    return { budget: null, balanced: null, premium: null };
  }

  const ppw = (p: SolarPanel) => p.price / p.wattage;
  const sorted = [...pool].sort((a, b) => ppw(a) - ppw(b) || b.rating - a.rating);

  if (sorted.length === 1) {
    return { budget: sorted[0], balanced: sorted[0], premium: sorted[0] };
  }
  if (sorted.length === 2) {
    return { budget: sorted[0], balanced: sorted[0], premium: sorted[1] };
  }

  return {
    budget: sorted[0],
    balanced: sorted[Math.floor(sorted.length / 2)],
    premium: sorted[sorted.length - 1],
  };
}

function pickInverter(
  continuousKw: number,
  country: RegionKey,
): Inverter | null {
  const requiredW = continuousKw * 1.25 * 1000;
  const inRegion = (inv: Inverter) => inv.availableRegions.includes(country);

  let candidates = INVERTERS.filter(
    (inv) => inv.ratedPowerW >= requiredW && inRegion(inv),
  );
  if (candidates.length === 0) {
    candidates = INVERTERS.filter((inv) => inv.ratedPowerW >= requiredW);
  }
  if (candidates.length === 0) {
    // No single inverter large enough — fall back to highest-power available
    candidates = [...INVERTERS].sort((a, b) => b.ratedPowerW - a.ratedPowerW);
    return candidates[0] ?? null;
  }
  candidates.sort((a, b) => a.price - b.price);
  return candidates[0];
}

function pickBattery(country: RegionKey): Battery | null {
  const inRegion = (b: Battery) => b.availableRegions.includes(country);
  let candidates = BATTERIES.filter(
    (b) => b.chemistry === "lfp" && inRegion(b),
  );
  if (candidates.length === 0) candidates = BATTERIES.filter(inRegion);
  if (candidates.length === 0) candidates = [...BATTERIES];
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.price / a.capacityKwh - b.price / b.capacityKwh);
  return candidates[0];
}

function sizeBattery(
  dailyKwh: number,
  backupDays: number,
  battery: Battery,
): number {
  const usablePerUnit = battery.capacityKwh * battery.depthOfDischarge;
  if (usablePerUnit <= 0) return 0;
  return Math.max(1, Math.ceil((dailyKwh * backupDays) / usablePerUnit));
}

function panelAreaM2(panel: SolarPanel): number {
  // dimensions stored in mm
  return (panel.dimensions.length * panel.dimensions.width) / 1_000_000;
}

export interface BuildBundlesArgs {
  profile: LoadProfile;
  solar: SolarIrradianceData;
  location: LocationData;
  prefs: QuickStartPreferences;
  country: RegionKey;
  electricityRate: number;
}

export function buildSolarBundles(args: BuildBundlesArgs): SolarBundle[] {
  const { profile, solar, location, prefs, country, electricityRate } = args;

  if (profile.annualKwh <= 0) return [];

  const tiers: BudgetTier[] = ["budget", "balanced", "premium"];
  const inverter = pickInverter(profile.continuousKw, country);

  const isOffGrid = prefs.gridMode === "off-grid";
  const battery = isOffGrid ? pickBattery(country) : null;
  const batteryCount =
    isOffGrid && battery
      ? sizeBattery(profile.dailyKwh, prefs.backupDays, battery)
      : 0;

  const tierPanels = pickPanelsByTier(country);

  const bundles: SolarBundle[] = [];

  for (const tier of tiers) {
    const panel = tierPanels[tier];
    if (!panel) continue;

    const sizing = sizeSolarArray({
      targetAnnualKwh: profile.annualKwh,
      panel,
      solarData: solar,
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      reserveMargin: prefs.reserveMargin,
    });

    if (sizing.panelCount <= 0 || sizing.annualProductionKwh <= 0) continue;

    const roi = calculateROI({
      config: {
        panelId: panel.id,
        panelCount: sizing.panelCount,
        batteryId: battery?.id ?? null,
        batteryCount,
        inverterId: inverter?.id ?? null,
        turbineId: null,
        turbineCount: 0,
        monthlyElectricityBill: 0,
        electricityRate,
        country,
      },
      // Savings cap at actual demand — surplus production with no net
      // metering earns nothing (safer default for grid-tied, exact for off-grid).
      annualProduction: Math.min(sizing.annualProductionKwh, profile.annualKwh),
      panel,
      battery,
      inverter,
      turbine: null,
    });

    const env = calculateEnvironmentalImpact(
      Math.min(sizing.annualProductionKwh, profile.annualKwh),
      country,
    );

    bundles.push({
      id: `${tier}-${panel.id}`,
      label: `${TIER_LABEL[tier]} · ${panel.brand} ${panel.model}`,
      tier,
      panel,
      panelCount: sizing.panelCount,
      inverter,
      battery,
      batteryCount,
      annualProductionKwh: sizing.annualProductionKwh,
      coverageRatio: sizing.annualProductionKwh / profile.annualKwh,
      totalCost: roi.totalSystemCost,
      effectiveCost: roi.effectiveCost,
      paybackYears: roi.simplePaybackYears,
      netSavings25Year: roi.netSavings25Year,
      roofAreaM2: panelAreaM2(panel) * sizing.panelCount,
      co2OffsetKg: env.annualCo2OffsetKg,
      treesEquivalent: env.equivalentTreesPlanted,
    });
  }

  return bundles;
}
