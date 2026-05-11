export interface SolarPanel {
  id: string;
  slug: string;
  brand: string;
  model: string;
  wattage: number;
  efficiency: number; // decimal e.g. 0.217 for 21.7%
  dimensions: { length: number; width: number; depth: number }; // mm
  weight: number; // kg
  warrantyYears: number;
  performanceWarranty: { year25: number }; // e.g. 0.92 = 92% output at year 25
  temperatureCoefficient: number; // %/°C e.g. -0.26
  technology: "monocrystalline" | "polycrystalline" | "thin-film" | "bifacial";
  price: number; // USD estimated
  rating: number; // 1-5
  imageUrl: string; // Unsplash URL
  tags: string[];
  description: string;
  availableRegions: string[]; // RegionKey[] — regions where product is sold
}

export interface Battery {
  id: string;
  slug: string;
  brand: string;
  model: string;
  capacityKwh: number;
  capacityAh: number;
  voltage: number;
  chemistry: "lithium-ion" | "lfp" | "lead-acid";
  cycleLife: number;
  depthOfDischarge: number; // decimal e.g. 0.90
  roundTripEfficiency: number; // decimal e.g. 0.90
  warrantyYears: number;
  dimensions: { height: number; width: number; depth: number }; // mm
  weight: number; // kg
  price: number;
  rating: number;
  imageUrl: string;
  tags: string[];
  description: string;
  availableRegions: string[]; // RegionKey[] — regions where product is sold
}

export interface WindTurbine {
  id: string;
  slug: string;
  brand: string;
  model: string;
  ratedPowerW: number;
  rotorDiameter: number; // meters
  sweptArea: number; // m²
  cutInSpeed: number; // m/s
  ratedSpeed: number; // m/s
  cutOutSpeed: number; // m/s
  hubHeightOptions: number[]; // meters
  type: "hawt" | "vawt"; // horizontal vs vertical axis
  voltage: number;
  warrantyYears: number;
  weight: number; // kg
  price: number;
  rating: number;
  imageUrl: string;
  tags: string[];
  description: string;
  availableRegions: string[]; // RegionKey[] — regions where product is sold
}

export interface Inverter {
  id: string;
  slug: string;
  brand: string;
  model: string;
  ratedPowerW: number;
  maxPowerW: number;
  efficiency: number; // decimal e.g. 0.97
  type: "string" | "micro" | "hybrid";
  mpptChannels: number;
  price: number;
  rating: number; // 1-5
  warrantyYears: number;
  imageUrl: string;
  tags: string[];
  description: string;
  availableRegions: string[]; // RegionKey[] — regions where product is sold
}

export type EquipmentCategory = "panels" | "batteries" | "turbines" | "inverters";

export type AnyEquipment = SolarPanel | Battery | WindTurbine | Inverter;

export interface EquipmentFilters {
  category: EquipmentCategory;
  brands: string[];
  priceRange: [number, number];
  wattageRange: [number, number];
  efficiencyRange: [number, number];
  capacityRange: [number, number];
  technologyTypes: string[];
  sortBy:
    | "price-asc"
    | "price-desc"
    | "efficiency"
    | "wattage"
    | "rating"
    | "capacity";
  searchQuery: string;
}
