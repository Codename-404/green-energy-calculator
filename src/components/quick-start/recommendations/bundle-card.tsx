"use client";

import Link from "next/link";
import { Sun, Zap, Battery as BatteryIcon, Leaf, TreePine, Ruler } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SolarBundle } from "@/types/quick-start";
import { CoverageBar } from "./coverage-bar";
import { CostBreakdown } from "./cost-breakdown";

interface Props {
  bundle: SolarBundle;
  currencySymbol?: string;
  recommended?: boolean;
}

const TIER_STYLES: Record<SolarBundle["tier"], string> = {
  budget: "bg-sky-500/10 text-sky-600",
  balanced: "bg-emerald-500/10 text-emerald-600",
  premium: "bg-amber-500/10 text-amber-600",
};

const TECH_LABEL: Record<string, string> = {
  monocrystalline: "Monocrystalline",
  polycrystalline: "Polycrystalline",
  "thin-film": "Thin-film",
  bifacial: "Bifacial",
};

function fmt(n: number, d = 0) {
  return n.toLocaleString(undefined, { maximumFractionDigits: d });
}

export function BundleCard({ bundle, currencySymbol = "$", recommended }: Props) {
  const { panel, inverter, battery, batteryCount } = bundle;

  return (
    <Card
      className={cn(
        "flex flex-col",
        recommended && "ring-2 ring-primary",
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                  TIER_STYLES[bundle.tier],
                )}
              >
                {bundle.tier}
              </span>
              {recommended && (
                <Badge variant="default" className="text-[10px]">
                  Best match
                </Badge>
              )}
            </div>
            <CardTitle className="mt-2 leading-snug">
              {TECH_LABEL[panel.technology] ?? panel.technology} {panel.wattage}W panel
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {(panel.efficiency * 100).toFixed(1)}% efficiency · 25-year warranty
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Sizing summary */}
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sun className="size-4 text-amber-500" />
            {bundle.panelCount} × {panel.wattage}W panels
            <span className="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
              {(bundle.panelCount * panel.wattage) / 1000} kWp
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {fmt(bundle.annualProductionKwh)} kWh/year generated
          </p>
        </div>

        <CoverageBar coverage={bundle.coverageRatio} />

        {/* Components */}
        <div className="space-y-1.5 text-xs">
          {inverter && (
            <div className="flex items-center gap-2">
              <Zap className="size-3.5 text-primary" />
              <span className="flex-1">String inverter</span>
              <span className="text-muted-foreground tabular-nums">
                {inverter.ratedPowerW} W
              </span>
            </div>
          )}
          {battery && batteryCount > 0 && (
            <div className="flex items-center gap-2">
              <BatteryIcon className="size-3.5 text-emerald-500" />
              <span className="flex-1">
                {batteryCount} × {battery.capacityKwh} kWh lithium battery
                {batteryCount > 1 ? " pack" : ""}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {(battery.capacityKwh * batteryCount).toFixed(1)} kWh
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Ruler className="size-3.5 text-muted-foreground" />
            <span className="flex-1">Roof area needed</span>
            <span className="text-muted-foreground tabular-nums">
              ~{bundle.roofAreaM2.toFixed(1)} m²
            </span>
          </div>
        </div>

        <CostBreakdown
          totalCost={bundle.totalCost}
          effectiveCost={bundle.effectiveCost}
          paybackYears={bundle.paybackYears}
          netSavings25Year={bundle.netSavings25Year}
          currencySymbol={currencySymbol}
        />

        {/* Env impact */}
        <div className="flex items-center gap-3 rounded-lg bg-emerald-500/5 p-2.5 text-xs">
          <Leaf className="size-4 shrink-0 text-emerald-600" />
          <span className="flex-1">
            <strong className="tabular-nums">{fmt(bundle.co2OffsetKg)}</strong> kg
            CO₂ offset/year
          </span>
          <TreePine className="size-4 shrink-0 text-emerald-600" />
          <span className="tabular-nums">
            ≈ <strong>{fmt(bundle.treesEquivalent)}</strong> trees
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Link
          href={`/equipment/${panel.slug}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full",
          )}
        >
          View panel details
        </Link>
      </CardFooter>
    </Card>
  );
}
