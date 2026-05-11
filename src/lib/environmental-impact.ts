import type { EnvironmentalImpact } from "@/types/calculations";
import {
  REGIONS,
  CO2_PER_TREE_YEAR,
  CO2_PER_GALLON_GAS,
  CO2_PER_BARREL_OIL,
  SYSTEM_LIFETIME_YEARS,
} from "./constants";
import type { RegionKey } from "./constants";

export function calculateEnvironmentalImpact(
  annualProductionKwh: number,
  country: RegionKey = "us"
): EnvironmentalImpact {
  const co2Factor = REGIONS[country].co2PerKwh;
  const annualCo2OffsetKg = annualProductionKwh * co2Factor;

  return {
    annualCo2OffsetKg,
    equivalentTreesPlanted: Math.round(annualCo2OffsetKg / CO2_PER_TREE_YEAR),
    equivalentGallonsGasoline: Math.round(annualCo2OffsetKg / CO2_PER_GALLON_GAS),
    equivalentBarrelsOil: parseFloat((annualCo2OffsetKg / CO2_PER_BARREL_OIL).toFixed(1)),
    lifetimeCo2OffsetTons: parseFloat(
      ((annualCo2OffsetKg * SYSTEM_LIFETIME_YEARS) / 1000).toFixed(1)
    ),
  };
}
