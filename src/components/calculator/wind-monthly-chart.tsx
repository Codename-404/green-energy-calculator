"use client";

import { useAtomValue } from "jotai";
import { windResultAtom } from "@/store/derived";
import { turbineCountAtom, solarLoadingAtom } from "@/store/atoms";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wind } from "lucide-react";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend,
} from "recharts";

export function WindMonthlyChart() {
  const windResult = useAtomValue(windResultAtom);
  const turbineCount = useAtomValue(turbineCountAtom);
  const loading = useAtomValue(solarLoadingAtom);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!windResult) {
    return null;
  }

  const chartData = windResult.monthlyBreakdown.map((m) => ({
    month: m.month,
    production: parseFloat((m.monthlyProduction * turbineCount).toFixed(1)),
    windSpeed: parseFloat(m.avgWindSpeed.toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="size-5 text-sky-500" />
          Monthly Wind Energy Production
        </CardTitle>
        <CardDescription>
          Energy output and average wind speed by month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full" role="img" aria-label="Monthly wind energy production chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted/50"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                yAxisId="production"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                label={{
                  value: "kWh",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11 },
                }}
              />
              <YAxis
                yAxisId="windSpeed"
                orientation="right"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                label={{
                  value: "m/s",
                  angle: 90,
                  position: "insideRight",
                  style: { fontSize: 11 },
                }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: "13px",
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => {
                  if (name === "production") return [`${value} kWh`, "Production"];
                  if (name === "windSpeed") return [`${value} m/s`, "Wind Speed"];
                  return [value, name];
                }}
              />
              <Legend
                iconType="rect"
                formatter={(value: string) => {
                  if (value === "production") return "Production (kWh)";
                  if (value === "windSpeed") return "Wind Speed (m/s)";
                  return value;
                }}
              />
              <Bar
                yAxisId="production"
                dataKey="production"
                fill="hsl(199, 89%, 65%)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Line
                yAxisId="windSpeed"
                type="monotone"
                dataKey="windSpeed"
                stroke="hsl(217, 91%, 50%)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(217, 91%, 50%)" }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
