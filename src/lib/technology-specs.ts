import type { SolarPanel, WindTurbine } from "@/types/equipment";

// ============ SOLAR TECHNOLOGY SPECS ============

export interface SolarTechnologySpec {
  key: SolarPanel["technology"];
  label: string;
  description: string;
  efficiency: number;
  temperatureCoefficient: number;
  warrantyYears: number;
  performanceWarrantyYear25: number;
  wattageOptions: number[];
  pricePerWatt: number;
}

export const SOLAR_TECHNOLOGY_SPECS: SolarTechnologySpec[] = [
  {
    key: "monocrystalline",
    label: "Monocrystalline",
    description: "Highest efficiency, premium price. Best for limited roof space.",
    efficiency: 0.21,
    temperatureCoefficient: -0.35,
    warrantyYears: 25,
    performanceWarrantyYear25: 0.87,
    wattageOptions: [350, 400, 450, 500],
    pricePerWatt: 0.9,
  },
  {
    key: "polycrystalline",
    label: "Polycrystalline",
    description: "Good value, slightly lower efficiency. Budget-friendly option.",
    efficiency: 0.17,
    temperatureCoefficient: -0.4,
    warrantyYears: 25,
    performanceWarrantyYear25: 0.83,
    wattageOptions: [300, 325, 350, 400],
    pricePerWatt: 0.65,
  },
  {
    key: "thin-film",
    label: "Thin-Film",
    description: "Lightweight & flexible, lower efficiency. Great for curved surfaces.",
    efficiency: 0.13,
    temperatureCoefficient: -0.2,
    warrantyYears: 20,
    performanceWarrantyYear25: 0.8,
    wattageOptions: [200, 300, 400],
    pricePerWatt: 0.5,
  },
  {
    key: "bifacial",
    label: "Bifacial",
    description: "Captures light from both sides. Up to 30% more energy yield.",
    efficiency: 0.215,
    temperatureCoefficient: -0.34,
    warrantyYears: 30,
    performanceWarrantyYear25: 0.9,
    wattageOptions: [400, 445, 500, 550],
    pricePerWatt: 1.0,
  },
];

// ============ WIND TECHNOLOGY SPECS ============

export interface WindPowerOption {
  watts: number;
  rotorDiameter: number;
  sweptArea: number;
}

export interface WindTechnologySpec {
  key: WindTurbine["type"];
  label: string;
  description: string;
  powerOptions: WindPowerOption[];
  cutInSpeed: number;
  ratedSpeed: number;
  cutOutSpeed: number;
  hubHeightOptions: number[];
  pricePerWatt: number;
  warrantyYears: number;
}

export const WIND_TECHNOLOGY_SPECS: WindTechnologySpec[] = [
  {
    key: "hawt",
    label: "Horizontal Axis (HAWT)",
    description: "Traditional propeller design. Higher efficiency, needs consistent wind direction.",
    powerOptions: [
      { watts: 1000, rotorDiameter: 2.5, sweptArea: 4.91 },
      { watts: 3000, rotorDiameter: 3.8, sweptArea: 11.34 },
      { watts: 5000, rotorDiameter: 5.0, sweptArea: 19.63 },
      { watts: 10000, rotorDiameter: 7.0, sweptArea: 38.48 },
      { watts: 15000, rotorDiameter: 9.0, sweptArea: 63.62 },
    ],
    cutInSpeed: 2.5,
    ratedSpeed: 11,
    cutOutSpeed: 25,
    hubHeightOptions: [10, 20, 30, 40],
    pricePerWatt: 3.0,
    warrantyYears: 10,
  },
  {
    key: "vawt",
    label: "Vertical Axis (VAWT)",
    description: "Omnidirectional. Quieter, better in turbulent or gusty wind conditions.",
    powerOptions: [
      { watts: 400, rotorDiameter: 1.2, sweptArea: 1.13 },
      { watts: 1000, rotorDiameter: 1.8, sweptArea: 2.54 },
      { watts: 3000, rotorDiameter: 3.0, sweptArea: 7.07 },
      { watts: 5000, rotorDiameter: 4.0, sweptArea: 12.57 },
    ],
    cutInSpeed: 2.0,
    ratedSpeed: 12,
    cutOutSpeed: 45,
    hubHeightOptions: [6, 10, 15, 20],
    pricePerWatt: 4.0,
    warrantyYears: 8,
  },
];

// ============ VIRTUAL EQUIPMENT FACTORIES ============

export function createVirtualPanel(
  techKey: string,
  wattage: number
): SolarPanel {
  const spec = SOLAR_TECHNOLOGY_SPECS.find((s) => s.key === techKey);
  if (!spec) throw new Error(`Unknown solar technology: ${techKey}`);

  return {
    id: `virtual-${techKey}-${wattage}`,
    slug: `${techKey}-${wattage}w`,
    brand: spec.label,
    model: `${wattage}W`,
    wattage,
    efficiency: spec.efficiency,
    dimensions: { length: 1755, width: 1038, depth: 35 },
    weight: 20,
    warrantyYears: spec.warrantyYears,
    performanceWarranty: { year25: spec.performanceWarrantyYear25 },
    temperatureCoefficient: spec.temperatureCoefficient,
    technology: techKey as SolarPanel["technology"],
    price: Math.round(wattage * spec.pricePerWatt),
    rating: 4.0,
    imageUrl: "",
    tags: [spec.label],
    description: `Generic ${spec.label} panel specification`,
    availableRegions: ["us", "ca", "eu", "uk", "oceania", "east_asia", "south_se_asia", "latam", "mena", "africa"],
  };
}

export function createVirtualTurbine(
  typeKey: "hawt" | "vawt",
  ratedPowerW: number
): WindTurbine | null {
  const spec = WIND_TECHNOLOGY_SPECS.find((s) => s.key === typeKey);
  if (!spec) return null;

  const powerOption = spec.powerOptions.find((p) => p.watts === ratedPowerW);
  if (!powerOption) return null;

  return {
    id: `virtual-${typeKey}-${ratedPowerW}`,
    slug: `${typeKey}-${ratedPowerW}w`,
    brand: spec.label,
    model: `${ratedPowerW >= 1000 ? `${ratedPowerW / 1000}kW` : `${ratedPowerW}W`}`,
    ratedPowerW,
    rotorDiameter: powerOption.rotorDiameter,
    sweptArea: powerOption.sweptArea,
    cutInSpeed: spec.cutInSpeed,
    ratedSpeed: spec.ratedSpeed,
    cutOutSpeed: spec.cutOutSpeed,
    hubHeightOptions: spec.hubHeightOptions,
    type: typeKey,
    voltage: ratedPowerW <= 3000 ? 240 : 480,
    warrantyYears: spec.warrantyYears,
    weight: Math.round(ratedPowerW * 0.01 + 20),
    price: Math.round(ratedPowerW * spec.pricePerWatt),
    rating: 4.0,
    imageUrl: "",
    tags: [spec.label],
    description: `Generic ${spec.label} turbine specification`,
    availableRegions: ["us", "ca", "eu", "uk", "oceania", "east_asia", "south_se_asia", "latam", "mena", "africa"],
  };
}

