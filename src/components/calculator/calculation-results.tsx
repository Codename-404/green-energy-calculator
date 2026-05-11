"use client";

import { useAtomValue } from "jotai";
import { solarLoadingAtom } from "@/store/atoms";
import { solarResultAtom } from "@/store/derived";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEnergy, formatNumber, formatPercent } from "@/lib/formatters";
import { Sun, TrendingUp, Gauge, Zap, Calendar, BarChart3 } from "lucide-react";
import { MethodologyNotice } from "./methodology-notice";

/** Individual stat card within the results grid */
function StatCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  return (
    <Card size="sm" className="border-green-200/60 dark:border-green-900/60">
      <CardContent className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">{label}</p>
          <p className="text-base font-semibold leading-tight">{value}</p>
          {description && (
            <p className="text-[11px] text-muted-foreground/60">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Skeleton loading state for results */
function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card size="sm" key={i}>
            <CardContent className="flex items-start gap-3">
              <Skeleton className="size-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CalculationResults() {
  const solarResult = useAtomValue(solarResultAtom);
  const solarLoading = useAtomValue(solarLoadingAtom);

  if (solarLoading) {
    return <ResultsSkeleton />;
  }

  if (!solarResult) {
    return (
      <Card size="sm" className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <Sun className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Set your location and select a panel to see production estimates.
          </p>
        </CardContent>
      </Card>
    );
  }

  const monthlyAvg = solarResult.annualProduction / 12;

  return (
    <div className="space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <TrendingUp className="size-4" />
          Production Estimates
        </CardTitle>
      </CardHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="Daily Average"
          value={formatEnergy(solarResult.dailyAverage)}
          icon={Sun}
          description="Average daily production"
        />
        <StatCard
          label="Monthly Average"
          value={formatEnergy(monthlyAvg)}
          icon={Calendar}
          description="Average per month"
        />
        <StatCard
          label="Annual Production"
          value={formatEnergy(solarResult.annualProduction)}
          icon={Zap}
          description="Total yearly output"
        />
        <StatCard
          label="Capacity Factor"
          value={formatPercent(solarResult.capacityFactor)}
          icon={Gauge}
          description="Actual vs. rated output"
        />
        <StatCard
          label="Specific Yield"
          value={`${formatNumber(solarResult.specificYield)} kWh/kWp`}
          icon={BarChart3}
          description="Energy per installed kWp"
        />
        <StatCard
          label="Peak Sun Hours"
          value={`${formatNumber(solarResult.peakSunHours)} hrs/day`}
          icon={Sun}
          description="Equivalent full-sun hours"
        />
      </div>

      <MethodologyNotice />
    </div>
  );
}
