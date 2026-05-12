// Physical constants
export const AIR_DENSITY_SEA_LEVEL = 1.225; // kg/m³

// Default system parameters
export const DEFAULT_TILT_ANGLE = 30;
export const DEFAULT_AZIMUTH = 180; // south-facing
export const DEFAULT_SHADING_FACTOR = 1.0; // no shade
export const DEFAULT_SYSTEM_LOSSES = 0.14; // 14%
export const DEFAULT_PANEL_COUNT = 10;
export const DEFAULT_ELECTRICITY_RATE_US = 0.16; // $/kWh US average
export const DEFAULT_ELECTRICITY_RATE_EU = 0.25; // €/kWh EU average
export const DEFAULT_MONTHLY_BILL = 150;

// ============ REGION CONFIGURATION ============
export interface RegionInfo {
  label: string;
  group: string;
  currency: string;
  currencySymbol: string;
  defaultRate: number; // default electricity rate
  co2PerKwh: number; // kg CO2 per kWh grid electricity
  taxCreditRate: number; // investment tax credit (0-1)
  /** Representative center for map default view */
  centerLat: number;
  centerLng: number;
  /** Default zoom for region-wide view (lower = wider) */
  centerZoom: number;
}

export const REGIONS = {
  // Americas
  us: { label: "United States", group: "Americas", currency: "USD", currencySymbol: "$", defaultRate: 0.16, co2PerKwh: 0.417, taxCreditRate: 0.30, centerLat: 39.5, centerLng: -98.35, centerZoom: 4 },
  ca: { label: "Canada", group: "Americas", currency: "CAD", currencySymbol: "C$", defaultRate: 0.13, co2PerKwh: 0.120, taxCreditRate: 0, centerLat: 56.13, centerLng: -106.35, centerZoom: 3 },
  latam: { label: "Latin America & Caribbean", group: "Americas", currency: "USD", currencySymbol: "$", defaultRate: 0.12, co2PerKwh: 0.200, taxCreditRate: 0, centerLat: -8.78, centerLng: -55.49, centerZoom: 3 },
  // Europe
  eu: { label: "European Union", group: "Europe", currency: "EUR", currencySymbol: "€", defaultRate: 0.25, co2PerKwh: 0.276, taxCreditRate: 0, centerLat: 50.85, centerLng: 9.6, centerZoom: 4 },
  uk: { label: "United Kingdom", group: "Europe", currency: "GBP", currencySymbol: "£", defaultRate: 0.28, co2PerKwh: 0.233, taxCreditRate: 0, centerLat: 54.5, centerLng: -2.5, centerZoom: 5 },
  // Asia & Pacific
  east_asia: { label: "East Asia", group: "Asia & Pacific", currency: "USD", currencySymbol: "$", defaultRate: 0.15, co2PerKwh: 0.555, taxCreditRate: 0, centerLat: 35.0, centerLng: 115.0, centerZoom: 3 },
  south_se_asia: { label: "South & Southeast Asia", group: "Asia & Pacific", currency: "USD", currencySymbol: "$", defaultRate: 0.08, co2PerKwh: 0.650, taxCreditRate: 0, centerLat: 12.0, centerLng: 100.0, centerZoom: 3 },
  oceania: { label: "Australia & Oceania", group: "Asia & Pacific", currency: "AUD", currencySymbol: "A$", defaultRate: 0.25, co2PerKwh: 0.656, taxCreditRate: 0, centerLat: -25.27, centerLng: 133.78, centerZoom: 4 },
  // Middle East & Africa
  mena: { label: "Middle East & North Africa", group: "Middle East & Africa", currency: "USD", currencySymbol: "$", defaultRate: 0.05, co2PerKwh: 0.500, taxCreditRate: 0, centerLat: 27.0, centerLng: 30.0, centerZoom: 3 },
  africa: { label: "Sub-Saharan Africa", group: "Middle East & Africa", currency: "USD", currencySymbol: "$", defaultRate: 0.10, co2PerKwh: 0.480, taxCreditRate: 0, centerLat: -1.0, centerLng: 21.0, centerZoom: 3 },
} as const satisfies Record<string, RegionInfo>;

export type RegionKey = keyof typeof REGIONS;

// Wind shear exponents by terrain type (power-law height extrapolation)
export const WIND_SHEAR_EXPONENTS: Record<string, number> = {
  open: 0.14,
  coastal: 0.11,
  suburban: 0.25,
  urban: 0.35,
};

// Surface wind speed correction factors relative to open terrain.
// NASA WS2M represents roughly open/agricultural conditions at 2m.
// These factors adjust that reference speed for actual terrain roughness
// *before* extrapolating to hub height via the shear exponent.
export const WIND_TERRAIN_SPEED_CORRECTIONS: Record<string, number> = {
  open: 1.0,     // reference terrain — matches NASA data
  coastal: 1.1,  // smooth fetch from water, ~10% higher surface wind
  suburban: 0.55, // trees & buildings reduce near-surface wind
  urban: 0.35,   // dense urban structures severely reduce surface wind
};

// Reference height for wind data (NASA POWER provides at 2m)
export const WIND_REFERENCE_HEIGHT = 2; // meters

// EPA emission-equivalence factors (region-specific grid factor lives in REGIONS[key].co2PerKwh)
export const CO2_PER_TREE_YEAR = 22; // kg CO2 absorbed per tree per year
export const CO2_PER_GALLON_GAS = 8.887; // kg CO2 per gallon gasoline
export const CO2_PER_BARREL_OIL = 430; // kg CO2 per barrel of oil

// Financial constants
export const FEDERAL_ITC_RATE = 0.30; // 30% Investment Tax Credit (US)
export const ELECTRICITY_INFLATION_RATE = 0.03; // 3% annual
export const SYSTEM_LIFETIME_YEARS = 25;
export const INSTALLATION_COST_PER_WATT = 0.50; // $/W labor estimate

// Generator/system efficiencies for wind
export const WIND_GENERATOR_EFFICIENCY = 0.90;
export const WIND_SYSTEM_EFFICIENCY = 0.85;

// Month names
export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export const MONTH_KEYS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
] as const;

export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// NASA POWER parameter keys
export const NASA_PARAMS = [
  "ALLSKY_SFC_SW_DWN",
  "CLRSKY_SFC_SW_DWN",
  "T2M",
  "T2M_MAX",
  "T2M_MIN",
  "WS2M",
] as const;

