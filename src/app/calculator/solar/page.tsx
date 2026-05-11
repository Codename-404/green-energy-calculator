import type { Metadata } from "next";
import { SolarCalculatorClient } from "./client";

export const metadata: Metadata = {
  title: "Solar Energy Calculator",
  description:
    "Calculate your solar energy production based on your location, panel type, roof angle, shading, and real-time weather data. Powered by NASA irradiance data.",
  keywords: [
    "solar calculator",
    "solar panel calculator",
    "solar energy production",
    "solar panel output",
    "solar irradiance",
    "PV calculator",
  ],
};

export default function SolarCalculatorPage() {
  return <SolarCalculatorClient />;
}
