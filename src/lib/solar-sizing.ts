import { calculateSolarProduction } from "./solar-calculations";
import { DEFAULT_SYSTEM_LOSSES } from "./constants";
import type { SolarPanel } from "@/types/equipment";
import type { SolarIrradianceData } from "@/types/api";

export interface SizeInputs {
  targetAnnualKwh: number;
  panel: SolarPanel;
  solarData: SolarIrradianceData;
  latitude: number;
  longitude: number;
  tiltAngle?: number;
  azimuth?: number;
  shadingFactor?: number;
  systemLosses?: number;
  reserveMargin?: number; // 0.1 = +10% oversize
}

export interface SizeResult {
  panelCount: number;
  annualProductionKwh: number;
  perPanelKwh: number;
}

/**
 * Reverse-sizes a solar array: given target annual kWh, returns panel count.
 *
 * calculateSolarProduction is linear in panelCount (only pRated depends on it),
 * so per-panel output × count is exact — no iteration needed.
 */
export function sizeSolarArray(i: SizeInputs): SizeResult {
  const tilt = i.tiltAngle ?? 30;
  const azimuth = i.azimuth ?? (i.latitude >= 0 ? 180 : 0);
  const shading = i.shadingFactor ?? 1;
  const losses = i.systemLosses ?? DEFAULT_SYSTEM_LOSSES;
  const margin = i.reserveMargin ?? 0.1;

  const perPanel = calculateSolarProduction(
    {
      latitude: i.latitude,
      longitude: i.longitude,
      panelWattage: i.panel.wattage,
      panelEfficiency: i.panel.efficiency,
      panelCount: 1,
      tiltAngle: tilt,
      azimuth,
      shadingFactor: shading,
      systemLosses: losses,
      temperatureCoefficient: i.panel.temperatureCoefficient,
    },
    i.solarData,
  ).annualProduction;

  if (perPanel <= 0) {
    return { panelCount: 1, annualProductionKwh: 0, perPanelKwh: 0 };
  }

  const count = Math.max(
    1,
    Math.ceil((i.targetAnnualKwh * (1 + margin)) / perPanel),
  );

  return {
    panelCount: count,
    annualProductionKwh: perPanel * count,
    perPanelKwh: perPanel,
  };
}
