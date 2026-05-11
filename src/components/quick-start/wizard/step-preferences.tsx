"use client";

import { useAtom } from "jotai";
import { Zap, BatteryCharging, Wallet, Percent } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { quickStartPreferencesAtom } from "@/store/atoms";
import type { BudgetTier, GridMode } from "@/types/quick-start";

const GRID_MODES: {
  value: GridMode;
  label: string;
  description: string;
}[] = [
  {
    value: "grid-tied",
    label: "Grid-tied",
    description:
      "Stay connected to the utility. No battery required — cheapest path.",
  },
  {
    value: "off-grid",
    label: "Off-grid",
    description:
      "Full independence. Needs a battery bank sized for your backup days.",
  },
];

const BUDGET_TIERS: {
  value: BudgetTier;
  label: string;
  description: string;
}[] = [
  {
    value: "budget",
    label: "Budget",
    description: "Polycrystalline panels — lowest up-front cost.",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "Monocrystalline — best value per watt.",
  },
  {
    value: "premium",
    label: "Premium",
    description: "Bifacial — highest output, longest warranty.",
  },
];

export function StepPreferences() {
  const [prefs, setPrefs] = useAtom(quickStartPreferencesAtom);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-amber-500" />
            How should we size the system?
          </CardTitle>
          <CardDescription>
            Tell us your grid situation and budget. We&apos;ll pick components
            that match.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold">Grid mode</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {GRID_MODES.map((mode) => {
                const selected = prefs.gridMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() =>
                      setPrefs((p) => ({ ...p, gridMode: mode.value }))
                    }
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-input hover:bg-muted/50",
                    )}
                  >
                    <span className="text-sm font-semibold">{mode.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {mode.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {prefs.gridMode === "off-grid" && (
            <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="backup-days"
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <BatteryCharging className="size-4 text-emerald-500" />
                  Battery backup
                </Label>
                <span className="text-sm tabular-nums">
                  {prefs.backupDays} day{prefs.backupDays !== 1 ? "s" : ""}
                </span>
              </div>
              <Slider
                value={[prefs.backupDays]}
                min={1}
                max={3}
                step={1}
                onValueChange={(v) => {
                  const days = Array.isArray(v) ? v[0] : v;
                  setPrefs((p) => ({ ...p, backupDays: days }));
                }}
                aria-label="Battery backup days"
              />
              <p className="text-xs text-muted-foreground">
                More days = bigger battery bank. 1 day covers overnight; 2–3
                days covers cloudy spells.
              </p>
            </div>
          )}

          <fieldset className="space-y-3">
            <legend className="flex items-center gap-2 text-sm font-semibold">
              <Wallet className="size-4 text-primary" />
              Budget tier
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {BUDGET_TIERS.map((tier) => {
                const selected = prefs.budgetTier === tier.value;
                return (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() =>
                      setPrefs((p) => ({ ...p, budgetTier: tier.value }))
                    }
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-input hover:bg-muted/50",
                    )}
                  >
                    <span className="text-sm font-semibold capitalize">
                      {tier.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tier.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              We&apos;ll show all three tiers regardless — this flags our pick
              as &quot;Best match&quot;.
            </p>
          </fieldset>

          <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="reserve-margin"
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <Percent className="size-4 text-sky-500" />
                Reserve margin
              </Label>
              <span className="text-sm tabular-nums">
                +{Math.round(prefs.reserveMargin * 100)}%
              </span>
            </div>
            <Slider
              value={[prefs.reserveMargin * 100]}
              min={0}
              max={30}
              step={5}
              onValueChange={(v) => {
                const pct = Array.isArray(v) ? v[0] : v;
                setPrefs((p) => ({ ...p, reserveMargin: pct / 100 }));
              }}
              aria-label="Reserve margin percentage"
            />
            <p className="text-xs text-muted-foreground">
              Oversize the array to cover cloudy weeks and future load growth.
              10% is a sensible default.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
