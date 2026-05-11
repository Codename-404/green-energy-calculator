"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { systemConfigAtom } from "@/store/atoms";
import { solarResultAtom, windResultAtom } from "@/store/derived";
import { calculateROI } from "@/lib/roi-calculations";
import { calculateEnvironmentalImpact } from "@/lib/environmental-impact";
import {
  formatCurrency,
  formatEnergy,
  formatNumber,
  formatCo2,
} from "@/lib/formatters";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { REGIONS } from "@/lib/constants";
import { FileText, Sun, Zap, Leaf, TrendingUp } from "lucide-react";
import {
  panels as allPanels,
  batteries as allBatteries,
  inverters as allInverters,
  turbines as allTurbines,
} from "@/data";

/** Summary section with a title and rows */
function SummarySection({
  icon: Icon,
  title,
  rows,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-green-600" />
        {title}
      </h4>
      <dl className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <dt className="text-muted-foreground/60">{row.label}</dt>
            <dd className="font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function SystemSummary() {
  const config = useAtomValue(systemConfigAtom);
  const solarResult = useAtomValue(solarResultAtom);
  const windResult = useAtomValue(windResultAtom);

  const summary = useMemo(() => {
    const panel = allPanels.find((p) => p.id === config.panelId) ?? null;
    const battery = allBatteries.find((b) => b.id === config.batteryId) ?? null;
    const inverter = allInverters.find((i) => i.id === config.inverterId) ?? null;
    const turbine = allTurbines.find((t) => t.id === config.turbineId) ?? null;

    const annualProduction =
      (solarResult?.annualProduction ?? 0) + (windResult?.annualProduction ?? 0);

    const roi =
      panel || turbine
        ? calculateROI({
            config,
            annualProduction,
            panel,
            battery,
            inverter,
            turbine,
          })
        : null;

    const impact =
      annualProduction > 0
        ? calculateEnvironmentalImpact(annualProduction, config.country)
        : null;

    return { panel, battery, inverter, turbine, annualProduction, roi, impact };
  }, [config, solarResult, windResult]);

  const currency = REGIONS[config.country].currency;
  const { panel, battery, inverter, turbine, annualProduction, roi, impact } = summary;

  const hasEquipment = panel || turbine;

  if (!hasEquipment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5 text-green-600" />
            System Summary
          </CardTitle>
          <CardDescription>
            A complete overview will appear once you configure your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select at least one piece of equipment (solar panel or wind turbine) to generate the summary.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="print:shadow-none" id="system-summary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5 text-green-600" />
          System Summary
        </CardTitle>
        <CardDescription>
          Complete overview of your green energy system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Equipment List */}
        <SummarySection
          icon={Sun}
          title="Equipment"
          rows={[
            ...(panel
              ? [
                  {
                    label: "Solar Panels",
                    value: `${config.panelCount}x ${panel.brand} ${panel.model} (${panel.wattage}W)`,
                  },
                ]
              : []),
            ...(battery && config.batteryCount > 0
              ? [
                  {
                    label: "Batteries",
                    value: `${config.batteryCount}x ${battery.brand} ${battery.model} (${battery.capacityKwh} kWh)`,
                  },
                ]
              : []),
            ...(inverter
              ? [
                  {
                    label: "Inverter",
                    value: `${inverter.brand} ${inverter.model} (${(inverter.ratedPowerW / 1000).toFixed(1)} kW)`,
                  },
                ]
              : []),
            ...(turbine && config.turbineCount > 0
              ? [
                  {
                    label: "Wind Turbines",
                    value: `${config.turbineCount}x ${turbine.brand} ${turbine.model} (${(turbine.ratedPowerW / 1000).toFixed(1)} kW)`,
                  },
                ]
              : []),
          ]}
        />

        <hr className="border-border" />

        {/* Energy Production */}
        <SummarySection
          icon={Zap}
          title="Energy Production"
          rows={[
            ...(solarResult
              ? [
                  {
                    label: "Annual Solar Production",
                    value: formatEnergy(solarResult.annualProduction),
                  },
                ]
              : []),
            ...(windResult
              ? [
                  {
                    label: "Annual Wind Production",
                    value: formatEnergy(windResult.annualProduction),
                  },
                ]
              : []),
            {
              label: "Total Annual Production",
              value: formatEnergy(annualProduction),
            },
          ]}
        />

        {roi && (
          <>
            <hr className="border-border" />
            <SummarySection
              icon={TrendingUp}
              title="Financial"
              rows={[
                {
                  label: "Total System Cost",
                  value: formatCurrency(roi.totalSystemCost, currency),
                },
                ...(roi.federalTaxCredit > 0
                  ? [
                      {
                        label: `Tax Credit (${Math.round(REGIONS[config.country].taxCreditRate * 100)}%)`,
                        value: `-${formatCurrency(roi.federalTaxCredit, currency)}`,
                      },
                    ]
                  : []),
                {
                  label: "Effective Cost",
                  value: formatCurrency(roi.effectiveCost, currency),
                },
                {
                  label: "Annual Savings",
                  value: formatCurrency(roi.annualEnergySavings, currency),
                },
                {
                  label: "Payback Period",
                  value:
                    roi.simplePaybackYears <= 25
                      ? `${formatNumber(roi.simplePaybackYears)} years`
                      : "25+ years",
                },
                {
                  label: "25-Year Net Savings",
                  value: formatCurrency(roi.netSavings25Year, currency),
                },
                {
                  label: "ROI",
                  value: `${formatNumber(roi.roiPercent)}%`,
                },
              ]}
            />
          </>
        )}

        {impact && (
          <>
            <hr className="border-border" />
            <SummarySection
              icon={Leaf}
              title="Environmental Impact (Annual)"
              rows={[
                {
                  label: "CO2 Offset",
                  value: formatCo2(impact.annualCo2OffsetKg),
                },
                {
                  label: "Trees Equivalent",
                  value: `${formatNumber(impact.equivalentTreesPlanted, 0)} trees`,
                },
                {
                  label: "Gasoline Saved",
                  value: `${formatNumber(impact.equivalentGallonsGasoline, 0)} gallons`,
                },
                {
                  label: "Lifetime CO2 Offset",
                  value: `${formatNumber(impact.lifetimeCo2OffsetTons)} tons`,
                },
              ]}
            />
          </>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Estimates based on equipment specifications and location-based solar/wind data.
          Actual results may vary based on installation, weather, and local conditions.
        </p>
      </CardFooter>
    </Card>
  );
}
