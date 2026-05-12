"use client";

import Link from "next/link";
import { useAtomValue } from "jotai";
import { AlertCircle, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  locationAtom,
  solarDataAtom,
  solarLoadingAtom,
  loadProfileAtom,
  solarBundlesAtom,
  quickStartCountryAtom,
  quickStartPreferencesAtom,
} from "@/store/atoms";
import { REGIONS } from "@/lib/constants";
import { BundleCard } from "../recommendations/bundle-card";

export function StepRecommendations() {
  const location = useAtomValue(locationAtom);
  const solarData = useAtomValue(solarDataAtom);
  const solarLoading = useAtomValue(solarLoadingAtom);
  const profile = useAtomValue(loadProfileAtom);
  const bundles = useAtomValue(solarBundlesAtom);
  const country = useAtomValue(quickStartCountryAtom);
  const prefs = useAtomValue(quickStartPreferencesAtom);

  const currencySymbol = REGIONS[country].currencySymbol;

  if (profile.annualKwh <= 0) {
    return (
      <EmptyState
        title="Pick appliances first"
        description="Go back to step 1 and select what you want to power. We need a demand figure before we can size a system."
      />
    );
  }

  if (!location || !solarData) {
    return (
      <EmptyState
        title={solarLoading ? "Fetching solar data…" : "Set your location"}
        description={
          solarLoading
            ? "Pulling NASA irradiance data for your coordinates."
            : "Go back to step 2 and enter your location so we can fetch real solar data."
        }
      />
    );
  }

  if (bundles.length === 0) {
    return (
      <EmptyState
        title="No matching bundles"
        description="We couldn't find panel/inverter combinations in stock for this region. Try a different region or adjust your preferences."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="size-5 text-amber-500" />
            Your solar bundles
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Each bundle covers your{" "}
            <strong>{profile.annualKwh.toFixed(0)} kWh/year</strong> demand in{" "}
            <strong>{location.displayName}</strong>.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Prices in {currencySymbol} are indicative — actual installed cost
            varies 20–40% by installer, permitting, and regional labor.
          </p>
        </div>
        <Link
          href="/system-builder"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "shrink-0",
          )}
        >
          Switch to advanced mode
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (
          <BundleCard
            key={bundle.id}
            bundle={bundle}
            currencySymbol={currencySymbol}
            recommended={bundle.tier === prefs.budgetTier}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Estimates use NREL PVWatts methodology with NASA POWER irradiance data
        (±10–15% accuracy). Final numbers depend on installer, roof shading,
        and local incentives.
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="size-5 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
