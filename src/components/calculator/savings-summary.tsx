"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { solarResultAtom, environmentalImpactAtom } from "@/store/derived";
import { solarLoadingAtom } from "@/store/atoms";
import { DEFAULT_ELECTRICITY_RATE_US } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrencyDetailed,
  formatCo2,
  formatNumber,
} from "@/lib/formatters";
import { DollarSign, Leaf, TreePine, Fuel } from "lucide-react";

/** Skeleton loading state */
function SavingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
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

export function SavingsSummary() {
  const solarResult = useAtomValue(solarResultAtom);
  const environmentalImpact = useAtomValue(environmentalImpactAtom);
  const solarLoading = useAtomValue(solarLoadingAtom);
  const [electricityRate, setElectricityRate] = useState(
    DEFAULT_ELECTRICITY_RATE_US
  );

  if (solarLoading) {
    return <SavingsSkeleton />;
  }

  if (!solarResult) {
    return null;
  }

  const annualSavings = solarResult.annualProduction * electricityRate;
  const monthlySavings = annualSavings / 12;

  return (
    <div className="space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <DollarSign className="size-4" />
          Savings & Impact
        </CardTitle>
      </CardHeader>

      {/* Electricity rate input */}
      <div className="flex items-center gap-3">
        <Label htmlFor="electricity-rate" className="shrink-0 text-sm">
          Electricity Rate
        </Label>
        <div className="relative w-32">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            id="electricity-rate"
            type="number"
            min={0.01}
            max={1.0}
            step={0.01}
            value={electricityRate}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val > 0 && val <= 1.0) {
                setElectricityRate(val);
              }
            }}
            className="pl-6"
            aria-label="Electricity rate in dollars per kilowatt hour"
          />
        </div>
        <span className="text-sm text-muted-foreground">/kWh</span>
      </div>

      {/* Savings cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card
          size="sm"
          className="border-green-200/60 dark:border-green-900/60"
        >
          <CardContent className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
              <DollarSign className="size-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">
                Annual Savings
              </p>
              <p className="text-base font-semibold leading-tight">
                {formatCurrencyDetailed(annualSavings)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          size="sm"
          className="border-green-200/60 dark:border-green-900/60"
        >
          <CardContent className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
              <DollarSign className="size-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">
                Monthly Savings
              </p>
              <p className="text-base font-semibold leading-tight">
                {formatCurrencyDetailed(monthlySavings)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental impact */}
      {environmentalImpact && (
        <>
          <CardHeader className="p-0 pt-2">
            <CardTitle className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <Leaf className="size-4" />
              Environmental Impact
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card size="sm">
              <CardContent className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                  <Leaf className="size-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">
                    Annual CO2 Offset
                  </p>
                  <p className="text-base font-semibold leading-tight">
                    {formatCo2(environmentalImpact.annualCo2OffsetKg)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardContent className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                  <TreePine className="size-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">
                    Equivalent Trees
                  </p>
                  <p className="text-base font-semibold leading-tight">
                    {formatNumber(
                      environmentalImpact.equivalentTreesPlanted,
                      0
                    )}{" "}
                    trees/year
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardContent className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                  <Fuel className="size-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">
                    Gasoline Saved
                  </p>
                  <p className="text-base font-semibold leading-tight">
                    {formatNumber(
                      environmentalImpact.equivalentGallonsGasoline,
                      0
                    )}{" "}
                    gal/year
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardContent className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                  <Leaf className="size-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">
                    25-Year CO2 Offset
                  </p>
                  <p className="text-base font-semibold leading-tight">
                    {formatNumber(
                      environmentalImpact.lifetimeCo2OffsetTons,
                      1
                    )}{" "}
                    tons
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
