"use client";

import { useAtom, useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { systemConfigAtom, locationAtom } from "@/store/atoms";
import { REGIONS } from "@/lib/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import type { SystemConfiguration } from "@/types/calculations";

import electricityRates from "@/data/electricity-rates.json";

const rates = electricityRates as Record<
  string,
  Record<string, { state?: string; country?: string; rate: number; currency: string }>
>;

export function StepFinancial() {
  const [config, setConfig] = useAtom(systemConfigAtom);
  const location = useAtomValue(locationAtom);
  const regionInfo = REGIONS[config.country];

  const updateConfig = useCallback(
    <K extends keyof SystemConfiguration>(key: K, value: SystemConfiguration[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    [setConfig]
  );

  const suggestedRate = useMemo(() => {
    if (!location) return null;
    const regionRates = rates[config.country];
    if (!regionRates) return null;

    if (location.state) {
      const stateCode = Object.keys(regionRates).find((code) => {
        const entry = regionRates[code];
        return (
          entry.state?.toLowerCase() === location.state?.toLowerCase() ||
          code.toLowerCase() === location.state?.toLowerCase()
        );
      });
      if (stateCode) return regionRates[stateCode].rate;
    }

    return null;
  }, [location, config.country]);

  const applySuggestedRate = useCallback(() => {
    if (suggestedRate) {
      updateConfig("electricityRate", suggestedRate);
    }
  }, [suggestedRate, updateConfig]);

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="size-5 text-green-600" />
          Your Energy Costs
        </CardTitle>
        <CardDescription>
          Enter your current electricity expenses to calculate potential savings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="monthly-bill">
            Monthly Electricity Bill ({regionInfo.currencySymbol})
          </Label>
          <Input
            id="monthly-bill"
            type="number"
            min={0}
            step={10}
            value={config.monthlyElectricityBill}
            onChange={(e) =>
              updateConfig(
                "monthlyElectricityBill",
                Math.max(0, parseFloat(e.target.value) || 0)
              )
            }
            aria-label="Monthly electricity bill"
          />
          <p className="text-xs text-muted-foreground">
            Your average monthly electricity bill before going solar.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="electricity-rate">
            Electricity Rate ({regionInfo.currencySymbol}/kWh)
          </Label>
          <div className="flex gap-2">
            <Input
              id="electricity-rate"
              type="number"
              min={0}
              step={0.01}
              value={config.electricityRate}
              onChange={(e) =>
                updateConfig(
                  "electricityRate",
                  Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              aria-label="Electricity rate per kWh"
            />
            {suggestedRate && suggestedRate !== config.electricityRate && (
              <button
                type="button"
                onClick={applySuggestedRate}
                className="shrink-0 rounded-lg bg-green-50 px-3 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
                aria-label={`Apply suggested rate of ${regionInfo.currencySymbol}${suggestedRate.toFixed(4)} per kWh`}
              >
                Use {regionInfo.currencySymbol}{suggestedRate.toFixed(2)}/kWh
              </button>
            )}
          </div>
          {suggestedRate && location?.state && (
            <p className="text-xs text-muted-foreground">
              Average rate for {location.state}: {regionInfo.currencySymbol}
              {suggestedRate.toFixed(4)}/kWh
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
