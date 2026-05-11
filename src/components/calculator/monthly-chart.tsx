"use client";

import { useAtomValue } from "jotai";
import { solarLoadingAtom } from "@/store/atoms";
import { solarResultAtom } from "@/store/derived";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import { formatEnergy } from "@/lib/formatters";

/** Custom tooltip for the bar chart */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md ring-1 ring-foreground/10">
      <p className="mb-1 text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">
        Production:{" "}
        <span className="font-medium text-green-600 dark:text-green-400">
          {formatEnergy(data.value as number)}
        </span>
      </p>
    </div>
  );
}

/** Skeleton state while loading */
function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-48" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function MonthlyChart() {
  const solarResult = useAtomValue(solarResultAtom);
  const solarLoading = useAtomValue(solarLoadingAtom);

  if (solarLoading) {
    return <ChartSkeleton />;
  }

  if (!solarResult) {
    return null;
  }

  const chartData = solarResult.monthlyBreakdown.map((m) => ({
    month: m.month.slice(0, 3),
    production: Math.round(m.monthlyProduction * 10) / 10,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <BarChart3 className="size-4" />
          Monthly Production
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val: number) => formatEnergy(val)}
              width={60}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
            />
            <Bar
              dataKey="production"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
