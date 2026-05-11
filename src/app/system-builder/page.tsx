import type { Metadata } from "next";
import { SystemBuilderClient } from "./client";

export const metadata: Metadata = {
  title: "System Builder",
  description:
    "Design and configure your custom green energy system with solar panels, batteries, inverters, and wind turbines. Get real-time cost breakdowns, ROI analysis, and environmental impact projections.",
};

export default function SystemBuilderPage() {
  return <SystemBuilderClient />;
}
