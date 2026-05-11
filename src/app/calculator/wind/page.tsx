import type { Metadata } from "next";
import { WindCalculatorClient } from "./client";

export const metadata: Metadata = {
  title: "Wind Energy Calculator",
  description:
    "Calculate your wind energy production based on your location, turbine specifications, hub height, and terrain type. Powered by NASA wind speed data.",
  keywords: [
    "wind calculator",
    "wind turbine calculator",
    "wind energy production",
    "wind power output",
    "wind speed data",
    "turbine output",
  ],
};

export default function WindCalculatorPage() {
  return <WindCalculatorClient />;
}
