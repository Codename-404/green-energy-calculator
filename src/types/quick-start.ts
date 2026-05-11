import type { SolarPanel, Battery, Inverter } from "./equipment";

export type GridMode = "grid-tied" | "off-grid";
export type BudgetTier = "budget" | "balanced" | "premium";

export interface QuickStartPreferences {
  gridMode: GridMode;
  backupDays: number; // 1-3, applies when off-grid
  budgetTier: BudgetTier;
  reserveMargin: number; // oversize fraction (0.1 = 10%)
}

export interface SolarBundle {
  id: string;
  label: string;
  tier: BudgetTier;
  panel: SolarPanel;
  panelCount: number;
  inverter: Inverter | null;
  battery: Battery | null;
  batteryCount: number;
  annualProductionKwh: number;
  coverageRatio: number; // production / demand
  totalCost: number;
  effectiveCost: number;
  paybackYears: number;
  netSavings25Year: number;
  roofAreaM2: number;
  co2OffsetKg: number;
  treesEquivalent: number;
}
