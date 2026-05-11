"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { systemConfigAtom } from "@/store/atoms";
import { solarResultAtom, windResultAtom } from "@/store/derived";
import { calculateROI } from "@/lib/roi-calculations";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TrendingUp, Calendar, PiggyBank, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import type { SolarPanel, Battery, Inverter, WindTurbine } from "@/types/equipment";
import type { ROIResult } from "@/types/calculations";
import { REGIONS } from "@/lib/constants";

import panelsData from "@/data/solar-panels.json";
import batteriesData from "@/data/batteries.json";
import invertersData from "@/data/inverters.json";
import turbinesData from "@/data/wind-turbines.json";

const panels = panelsData as unknown as SolarPanel[];
const batteries = batteriesData as unknown as Battery[];
const inverters = invertersData as unknown as Inverter[];
const turbines = turbinesData as unknown as WindTurbine[];

/** Single stat display card */
function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border bg-card p-3 ${className}`}
      role="figure"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
        <Icon className="size-4 text-green-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold leading-tight">{value}</p>
        {subtext && (
          <p className="text-xs text-muted-foreground">{subtext}</p>
        )}
      </div>
    </div>
  );
}

export function ROICalculator() {
  const config = useAtomValue(systemConfigAtom);
  const solarResult = useAtomValue(solarResultAtom);
  const windResult = useAtomValue(windResultAtom);

  const roi = useMemo<ROIResult | null>(() => {
    const panel = panels.find((p) => p.id === config.panelId) ?? null;
    const battery = batteries.find((b) => b.id === config.batteryId) ?? null;
    const inverter = inverters.find((i) => i.id === config.inverterId) ?? null;
    const turbine = turbines.find((t) => t.id === config.turbineId) ?? null;

    const annualProduction =
      (solarResult?.annualProduction ?? 0) + (windResult?.annualProduction ?? 0);

    // Need at least some equipment and production data
    if (!panel && !turbine) return null;
    if (annualProduction === 0) return null;

    return calculateROI({
      config,
      annualProduction,
      panel,
      battery,
      inverter,
      turbine,
    });
  }, [config, solarResult, windResult]);

  const currency = REGIONS[config.country].currency;

  if (!roi) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-green-600" />
            ROI Analysis
          </CardTitle>
          <CardDescription>
            Select equipment and set your location to see ROI projections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your return on investment will appear here once you have selected
            equipment and provided location data for energy production estimates.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = roi.cumulativeSavings.map((item) => ({
    year: `Year ${item.year}`,
    yearNum: item.year,
    cumulative: Math.round(item.cumulative),
    annual: Math.round(item.savings),
  }));

  const paybackFormatted =
    roi.simplePaybackYears <= 25
      ? `${formatNumber(roi.simplePaybackYears)} years`
      : "25+ years";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5 text-green-600" />
          ROI Analysis
        </CardTitle>
        <CardDescription>
          Return on investment projections over the system's 25-year lifetime.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Calendar}
            label="Payback Period"
            value={paybackFormatted}
            subtext="Simple payback"
          />
          <StatCard
            icon={PiggyBank}
            label="Annual Savings"
            value={formatCurrency(roi.annualEnergySavings, currency)}
            subtext="First year"
          />
          <StatCard
            icon={TrendingUp}
            label="25-Year Net Savings"
            value={formatCurrency(roi.netSavings25Year, currency)}
            subtext="After system cost"
          />
          <StatCard
            icon={BarChart3}
            label="ROI"
            value={`${formatNumber(roi.roiPercent)}%`}
            subtext="Lifetime return"
          />
        </div>

        {/* Cumulative Savings Chart */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Cumulative Savings Over 25 Years</h4>
          <div className="h-72 w-full" role="img" aria-label="Cumulative savings chart showing breakeven point">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="yearNum"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `Yr ${v}`}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    `$${(v / 1000).toFixed(0)}k`
                  }
                  className="text-muted-foreground"
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [
                    formatCurrency(value as number, currency),
                  ]}
                  labelFormatter={(label) => `Year ${label}`}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                    color: "hsl(var(--card-foreground))",
                  }}
                />
                <ReferenceLine
                  y={0}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="4 4"
                  label={{
                    value: "Breakeven",
                    position: "insideTopRight",
                    fontSize: 11,
                    fill: "hsl(var(--destructive))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  fill="hsl(142.1 76.2% 36.3% / 0.15)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="hsl(142.1 76.2% 36.3%)"
                  strokeWidth={2}
                  dot={false}
                  name="Cumulative Net Savings"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
