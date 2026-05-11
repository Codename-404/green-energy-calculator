"use client";

import { useAtomValue } from "jotai";
import { windResultAtom } from "@/store/derived";
import { turbineCountAtom, solarLoadingAtom } from "@/store/atoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatEnergy,
  formatPercent,
  formatWindSpeed,
  formatNumber,
} from "@/lib/formatters";
import { Wind, Zap, TrendingUp, Gauge } from "lucide-react";
import { MethodologyNotice } from "./methodology-notice";

export function WindResults() {
  const windResult = useAtomValue(windResultAtom);
  const turbineCount = useAtomValue(turbineCountAtom);
  const loading = useAtomValue(solarLoadingAtom);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!windResult) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Wind className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Select a location and turbine to see wind energy results.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "Daily Average",
      value: formatEnergy(windResult.dailyAverage * turbineCount),
      subtext: "per day",
      icon: Zap,
      color: "text-sky-600 dark:text-sky-400",
      bgColor: "bg-sky-500/10",
    },
    {
      label: "Annual Production",
      value: formatEnergy(windResult.annualProduction * turbineCount),
      subtext: "per year",
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Capacity Factor",
      value: formatPercent(windResult.capacityFactor),
      subtext: "utilization",
      icon: Gauge,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Avg Wind Speed",
      value: formatWindSpeed(windResult.avgWindSpeedAtHub),
      subtext: "at hub height",
      icon: Wind,
      color: "text-sky-600 dark:text-sky-400",
      bgColor: "bg-sky-500/10",
    },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.subtext}
                    </p>
                  </div>
                  <div
                    className={`flex size-9 items-center justify-center rounded-lg ${stat.bgColor}`}
                  >
                    <Icon className={`size-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <MethodologyNotice />
    </div>
  );
}
