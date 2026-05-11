import type {
  SolarPanel,
  Battery,
  WindTurbine,
  Inverter,
} from "@/types/equipment";
import type { Appliance } from "@/types/appliance";
import type { Article } from "@/types/content";

import panelsJson from "./solar-panels.json";
import batteriesJson from "./batteries.json";
import turbinesJson from "./wind-turbines.json";
import invertersJson from "./inverters.json";
import appliancesJson from "./appliances.json";
import presetsJson from "./appliance-presets.json";
import electricityRatesJson from "./electricity-rates.json";

import howWeCalculate from "./articles/how-we-calculate.json";
import solarPanelTypes from "./articles/solar-panel-types.json";
import batteryChemistryGuide from "./articles/battery-chemistry-guide.json";

export interface AppliancePreset {
  id: string;
  label: string;
  description: string;
  icon: string;
  items: { applianceId: string; quantity: number }[];
}

export interface RegionRate {
  state?: string;
  country?: string;
  rate: number;
  currency: string;
}

export type ElectricityRates = Record<string, Record<string, RegionRate>>;

export const panels: SolarPanel[] = panelsJson as SolarPanel[];
export const batteries: Battery[] = batteriesJson as Battery[];
export const turbines: WindTurbine[] = turbinesJson as WindTurbine[];
export const inverters: Inverter[] = invertersJson as Inverter[];
export const appliances: Appliance[] = appliancesJson as Appliance[];
export const appliancePresets: AppliancePreset[] = presetsJson as AppliancePreset[];
export const electricityRates: ElectricityRates =
  electricityRatesJson as ElectricityRates;

export const articles: Article[] = [
  howWeCalculate as Article,
  solarPanelTypes as Article,
  batteryChemistryGuide as Article,
];
