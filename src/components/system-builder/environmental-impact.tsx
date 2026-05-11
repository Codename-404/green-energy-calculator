"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { systemConfigAtom } from "@/store/atoms";
import { solarResultAtom, windResultAtom } from "@/store/derived";
import { calculateEnvironmentalImpact } from "@/lib/environmental-impact";
import { formatCo2, formatNumber } from "@/lib/formatters";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Leaf, TreePine, Fuel, Droplets } from "lucide-react";
import type { EnvironmentalImpact as EnvironmentalImpactType } from "@/types/calculations";

/** Animated impact stat card with icon */
function ImpactCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  color: "green" | "emerald" | "amber" | "blue";
}) {
  const colorMap = {
    green: {
      bg: "bg-green-50 dark:bg-green-950",
      icon: "text-green-600",
      border: "border-green-200 dark:border-green-800",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-950",
      icon: "text-emerald-600",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950",
      icon: "text-amber-600",
      border: "border-amber-200 dark:border-amber-800",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950",
      icon: "text-blue-600",
      border: "border-blue-200 dark:border-blue-800",
    },
  };

  const c = colorMap[color];

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-xl border p-4 text-center ${c.border}`}
      role="figure"
      aria-label={`${label}: ${value} ${unit}`}
    >
      <div
        className={`flex size-12 items-center justify-center rounded-full ${c.bg}`}
      >
        <Icon className={`size-6 ${c.icon}`} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function EnvironmentalImpact() {
  const config = useAtomValue(systemConfigAtom);
  const solarResult = useAtomValue(solarResultAtom);
  const windResult = useAtomValue(windResultAtom);

  const impact = useMemo<EnvironmentalImpactType | null>(() => {
    const totalProduction =
      (solarResult?.annualProduction ?? 0) + (windResult?.annualProduction ?? 0);
    if (totalProduction === 0) return null;
    return calculateEnvironmentalImpact(totalProduction, config.country);
  }, [solarResult, windResult, config.country]);

  if (!impact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="size-5 text-green-600" />
            Environmental Impact
          </CardTitle>
          <CardDescription>
            Set your location and equipment to see your environmental impact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Environmental impact data will appear here once energy production
            estimates are available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="size-5 text-green-600" />
          Environmental Impact
        </CardTitle>
        <CardDescription>
          Your annual contribution to a cleaner planet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ImpactCard
            icon={Leaf}
            label="Annual CO2 Offset"
            value={formatCo2(impact.annualCo2OffsetKg)}
            unit="of CO2 per year"
            color="green"
          />
          <ImpactCard
            icon={TreePine}
            label="Trees Equivalent"
            value={formatNumber(impact.equivalentTreesPlanted, 0)}
            unit="trees planted"
            color="emerald"
          />
          <ImpactCard
            icon={Fuel}
            label="Gasoline Saved"
            value={formatNumber(impact.equivalentGallonsGasoline, 0)}
            unit="gallons not burned"
            color="amber"
          />
          <ImpactCard
            icon={Droplets}
            label="Oil Barrels Offset"
            value={formatNumber(impact.equivalentBarrelsOil)}
            unit="barrels per year"
            color="blue"
          />
        </div>

        <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-950">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Over the 25-year system lifetime, you could offset approximately{" "}
            <span className="font-bold">
              {formatNumber(impact.lifetimeCo2OffsetTons)} metric tons
            </span>{" "}
            of CO2 emissions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
