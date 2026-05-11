"use client";

import { useAtomValue } from "jotai";
import { MapPin, Zap, Gauge, Calendar, BatteryCharging, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  loadProfileAtom,
  locationAtom,
  quickStartCountryAtom,
  quickStartPreferencesAtom,
} from "@/store/atoms";
import { REGIONS } from "@/lib/constants";

function fmt(n: number, d = 0): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: d });
}

export function SummarySidebar() {
  const profile = useAtomValue(loadProfileAtom);
  const location = useAtomValue(locationAtom);
  const country = useAtomValue(quickStartCountryAtom);
  const prefs = useAtomValue(quickStartPreferencesAtom);

  const region = REGIONS[country];

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Your setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Load */}
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Load
          </p>
          <Row
            icon={<Zap className="size-3.5 text-amber-500" />}
            label="Daily"
            value={`${fmt(profile.dailyKwh, 2)} kWh`}
          />
          <Row
            icon={<Gauge className="size-3.5 text-primary" />}
            label="Peak"
            value={`${fmt(profile.continuousKw, 2)} kW`}
          />
          <Row
            icon={<Calendar className="size-3.5 text-emerald-500" />}
            label="Annual"
            value={`${fmt(profile.annualKwh, 0)} kWh`}
          />
          <Row
            icon={null}
            label="Items"
            value={String(profile.itemCount)}
          />
        </section>

        <Separator />

        {/* Location */}
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Location
          </p>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <span className="flex-1">
              {location?.displayName ?? (
                <span className="text-muted-foreground">Not set</span>
              )}
            </span>
          </div>
          <Row
            icon={null}
            label="Region"
            value={region.label}
          />
          <Row
            icon={null}
            label="Rate"
            value={`${region.currencySymbol}${region.defaultRate.toFixed(2)}/kWh`}
          />
        </section>

        <Separator />

        {/* Preferences */}
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Preferences
          </p>
          <Row
            icon={<Wallet className="size-3.5 text-primary" />}
            label="Tier"
            value={
              <span className="capitalize">{prefs.budgetTier}</span>
            }
          />
          <Row
            icon={null}
            label="Mode"
            value={prefs.gridMode === "off-grid" ? "Off-grid" : "Grid-tied"}
          />
          {prefs.gridMode === "off-grid" && (
            <Row
              icon={<BatteryCharging className="size-3.5 text-emerald-500" />}
              label="Backup"
              value={`${prefs.backupDays} day${prefs.backupDays !== 1 ? "s" : ""}`}
            />
          )}
          <Row
            icon={null}
            label="Reserve"
            value={`+${Math.round(prefs.reserveMargin * 100)}%`}
          />
        </section>
      </CardContent>
    </Card>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon ? (
        icon
      ) : (
        <span className="size-3.5 shrink-0" aria-hidden />
      )}
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
