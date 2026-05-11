export type ApplianceCategory =
  | "cooling"
  | "heating"
  | "lighting"
  | "kitchen"
  | "appliance"
  | "electronics"
  | "entertainment"
  | "mobility";

export interface Appliance {
  id: string;
  name: string;
  icon: string; // lucide-react icon name
  category: ApplianceCategory;
  watts: number; // running wattage
  hoursPerDay: number; // default daily runtime
  isInductive?: boolean;
  startupMultiplier?: number; // surge factor for inductive loads
  dutyCycle?: number; // fraction of runtime actively drawing power (0-1)
  aliases?: string[]; // extra search terms (e.g. "AC", "fridge")
}

export interface ApplianceSelection {
  applianceId: string;
  quantity: number;
  wattsOverride?: number;
  hoursOverride?: number;
}

export interface CustomAppliance {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
  quantity: number;
}

export interface LoadProfile {
  dailyKwh: number;
  annualKwh: number;
  continuousKw: number; // sum of running watts
  peakKw: number; // sum incl. startup surge
  itemCount: number; // total quantity across all appliances
}
