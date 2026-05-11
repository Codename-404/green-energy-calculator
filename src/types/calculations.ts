export interface SolarCalculationInput {
  latitude: number;
  longitude: number;
  panelWattage: number;
  panelEfficiency: number;
  panelCount: number;
  tiltAngle: number; // degrees
  azimuth: number; // degrees (180 = south in northern hemisphere)
  shadingFactor: number; // 0-1 (1 = no shading)
  systemLosses: number; // 0-1 (0.14 = 14% typical)
  temperatureCoefficient: number; // %/°C
}

export interface MonthlyProduction {
  month: string;
  monthIndex: number;
  irradiance: number; // kWh/m²/day
  avgTemperature: number; // °C
  daysInMonth: number;
  dailyProduction: number; // kWh
  monthlyProduction: number; // kWh
}

export interface SolarCalculationResult {
  monthlyBreakdown: MonthlyProduction[];
  annualProduction: number; // kWh/year
  dailyAverage: number; // kWh/day
  capacityFactor: number; // 0-1
  performanceRatio: number; // 0-1
  specificYield: number; // kWh/kWp/year
  peakSunHours: number; // daily average
}

export interface WindCalculationInput {
  latitude: number;
  longitude: number;
  turbineRatedPower: number; // watts
  rotorDiameter: number; // meters
  hubHeight: number; // meters
  cutInSpeed: number; // m/s
  ratedSpeed: number; // m/s
  cutOutSpeed: number; // m/s
  terrainType: "open" | "suburban" | "urban" | "coastal";
}

export interface WindCalculationResult {
  monthlyBreakdown: {
    month: string;
    monthIndex: number;
    avgWindSpeed: number; // m/s at hub height
    avgPower: number; // watts
    monthlyProduction: number; // kWh
  }[];
  annualProduction: number; // kWh/year
  dailyAverage: number; // kWh/day
  capacityFactor: number; // 0-1
  avgWindSpeedAtHub: number; // m/s
}

export interface ROIResult {
  totalSystemCost: number;
  installationCost: number;
  federalTaxCredit: number; // US ITC 30%
  effectiveCost: number;
  annualEnergySavings: number;
  simplePaybackYears: number;
  netSavings25Year: number;
  roiPercent: number;
  cumulativeSavings: { year: number; savings: number; cumulative: number }[];
}

export interface EnvironmentalImpact {
  annualCo2OffsetKg: number;
  equivalentTreesPlanted: number;
  equivalentGallonsGasoline: number;
  equivalentBarrelsOil: number;
  lifetimeCo2OffsetTons: number; // 25 years
}

export interface SystemConfiguration {
  panelId: string | null;
  panelCount: number;
  batteryId: string | null;
  batteryCount: number;
  inverterId: string | null;
  turbineId: string | null;
  turbineCount: number;
  monthlyElectricityBill: number;
  electricityRate: number; // per kWh in local currency
  country: import("@/lib/constants").RegionKey;
}
