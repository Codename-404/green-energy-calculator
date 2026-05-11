import type { Metadata } from "next";
import { EquipmentClient } from "./client";

export const metadata: Metadata = {
  title: "Equipment Database",
  description:
    "Browse and compare solar panels, wind turbines, batteries, and inverters. Filter by brand, price, efficiency, and technology type. Find the perfect equipment for your green energy system.",
  keywords: [
    "solar panel comparison",
    "wind turbine comparison",
    "battery storage comparison",
    "inverter comparison",
    "renewable energy equipment",
    "solar panel database",
  ],
};

export default function EquipmentPage() {
  return <EquipmentClient />;
}
