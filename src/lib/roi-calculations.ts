import type { ROIResult, SystemConfiguration } from "@/types/calculations";
import type { SolarPanel, Battery, Inverter, WindTurbine } from "@/types/equipment";
import {
  REGIONS,
  ELECTRICITY_INFLATION_RATE,
  SYSTEM_LIFETIME_YEARS,
  INSTALLATION_COST_PER_WATT,
} from "./constants";

interface ROIInput {
  config: SystemConfiguration;
  annualProduction: number; // kWh/year (solar + wind combined)
  panel: SolarPanel | null;
  battery: Battery | null;
  inverter: Inverter | null;
  turbine: WindTurbine | null;
}

export function calculateROI(input: ROIInput): ROIResult {
  const { config, annualProduction, panel, battery, inverter, turbine } = input;

  // Equipment costs
  const panelCost = panel ? panel.price * config.panelCount : 0;
  const batteryCost = battery ? battery.price * config.batteryCount : 0;
  const inverterCost = inverter ? inverter.price : 0;
  const turbineCost = turbine ? turbine.price * config.turbineCount : 0;

  // Installation cost estimate
  const totalWattage =
    (panel ? panel.wattage * config.panelCount : 0) +
    (turbine ? turbine.ratedPowerW * config.turbineCount : 0);
  const installationCost = totalWattage * INSTALLATION_COST_PER_WATT;

  const totalSystemCost =
    panelCost + batteryCost + inverterCost + turbineCost + installationCost;

  // Tax credit (region-specific, e.g. US 30% ITC)
  const taxCreditRate = REGIONS[config.country].taxCreditRate;
  const federalTaxCredit = taxCreditRate > 0 ? totalSystemCost * taxCreditRate : 0;
  const effectiveCost = totalSystemCost - federalTaxCredit;

  // Annual energy savings
  const annualEnergySavings = annualProduction * config.electricityRate;

  // 25-year cumulative savings with electricity inflation
  const cumulativeSavings: { year: number; savings: number; cumulative: number }[] = [];
  let totalSavings = 0;

  for (let year = 1; year <= SYSTEM_LIFETIME_YEARS; year++) {
    const yearSavings =
      annualEnergySavings *
      Math.pow(1 + ELECTRICITY_INFLATION_RATE, year - 1);
    totalSavings += yearSavings;
    cumulativeSavings.push({
      year,
      savings: yearSavings,
      cumulative: totalSavings - effectiveCost,
    });
  }

  // Simple payback period
  let paybackYears = SYSTEM_LIFETIME_YEARS + 1;
  let runningTotal = 0;
  for (let year = 1; year <= SYSTEM_LIFETIME_YEARS; year++) {
    const yearSavings =
      annualEnergySavings *
      Math.pow(1 + ELECTRICITY_INFLATION_RATE, year - 1);
    runningTotal += yearSavings;
    if (runningTotal >= effectiveCost) {
      // Interpolate for fractional year
      const prevTotal = runningTotal - yearSavings;
      const remaining = effectiveCost - prevTotal;
      paybackYears = year - 1 + remaining / yearSavings;
      break;
    }
  }

  const netSavings25Year = totalSavings - effectiveCost;
  const roiPercent =
    effectiveCost > 0 ? (netSavings25Year / effectiveCost) * 100 : 0;

  return {
    totalSystemCost,
    installationCost,
    federalTaxCredit,
    effectiveCost,
    annualEnergySavings,
    simplePaybackYears: paybackYears,
    netSavings25Year,
    roiPercent,
    cumulativeSavings,
  };
}

