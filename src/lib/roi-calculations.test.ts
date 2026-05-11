import { describe, expect, test } from "vitest";
import { calculateROI } from "./roi-calculations";
import type { SolarPanel, Inverter } from "@/types/equipment";
import type { SystemConfiguration } from "@/types/calculations";

const PANEL: SolarPanel = {
  id: "test-panel",
  brand: "Test",
  model: "T400",
  technology: "monocrystalline",
  wattage: 400,
  efficiency: 0.21,
  temperatureCoefficient: -0.35,
  warranty: { product: 12, performance: 25 },
  dimensions: { length: 1722, width: 1134, depth: 35 },
  weight: 21,
  price: 200,
  rating: 4.5,
  availableRegions: ["us"],
};

const INVERTER: Inverter = {
  id: "test-inv",
  brand: "Test",
  model: "I5K",
  type: "string",
  ratedPowerW: 5000,
  efficiency: 0.97,
  warranty: 10,
  price: 1200,
  rating: 4.5,
  availableRegions: ["us"],
};

const CONFIG: SystemConfiguration = {
  panelId: PANEL.id,
  panelCount: 10,
  batteryId: null,
  batteryCount: 0,
  inverterId: INVERTER.id,
  turbineId: null,
  turbineCount: 0,
  monthlyElectricityBill: 150,
  electricityRate: 0.16,
  country: "us",
};

describe("calculateROI", () => {
  test("US 30% ITC reduces effective cost vs non-credit region", () => {
    const us = calculateROI({
      config: CONFIG,
      annualProduction: 6000,
      panel: PANEL,
      battery: null,
      inverter: INVERTER,
      turbine: null,
    });
    const eu = calculateROI({
      config: { ...CONFIG, country: "eu" },
      annualProduction: 6000,
      panel: PANEL,
      battery: null,
      inverter: INVERTER,
      turbine: null,
    });

    expect(us.federalTaxCredit).toBeGreaterThan(0);
    expect(eu.federalTaxCredit).toBe(0);
    expect(us.effectiveCost).toBeLessThan(eu.effectiveCost);
  });

  test("higher production shortens simple payback", () => {
    const low = calculateROI({
      config: CONFIG,
      annualProduction: 3000,
      panel: PANEL,
      battery: null,
      inverter: INVERTER,
      turbine: null,
    });
    const high = calculateROI({
      config: CONFIG,
      annualProduction: 9000,
      panel: PANEL,
      battery: null,
      inverter: INVERTER,
      turbine: null,
    });

    expect(high.simplePaybackYears).toBeLessThan(low.simplePaybackYears);
  });

  test("25-year cumulative savings array has exactly 25 entries", () => {
    const roi = calculateROI({
      config: CONFIG,
      annualProduction: 6000,
      panel: PANEL,
      battery: null,
      inverter: INVERTER,
      turbine: null,
    });

    expect(roi.cumulativeSavings).toHaveLength(25);
    expect(roi.cumulativeSavings[0].year).toBe(1);
    expect(roi.cumulativeSavings[24].year).toBe(25);
  });

  test("electricity inflation makes year-25 savings exceed year-1", () => {
    const roi = calculateROI({
      config: CONFIG,
      annualProduction: 6000,
      panel: PANEL,
      battery: null,
      inverter: INVERTER,
      turbine: null,
    });

    const year1 = roi.cumulativeSavings[0].savings;
    const year25 = roi.cumulativeSavings[24].savings;
    expect(year25).toBeGreaterThan(year1);
  });
});
