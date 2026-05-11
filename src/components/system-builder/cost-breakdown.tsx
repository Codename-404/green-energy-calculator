"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { systemConfigAtom } from "@/store/atoms";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { REGIONS, INSTALLATION_COST_PER_WATT } from "@/lib/constants";
import { panels, batteries, inverters, turbines } from "@/data";

interface CostLineItem {
  label: string;
  detail: string;
  amount: number;
}

export function CostBreakdown() {
  const config = useAtomValue(systemConfigAtom);

  const breakdown = useMemo(() => {
    const panel = panels.find((p) => p.id === config.panelId) ?? null;
    const battery = batteries.find((b) => b.id === config.batteryId) ?? null;
    const inverter = inverters.find((i) => i.id === config.inverterId) ?? null;
    const turbine = turbines.find((t) => t.id === config.turbineId) ?? null;

    const items: CostLineItem[] = [];

    // Panel cost
    if (panel) {
      items.push({
        label: "Solar Panels",
        detail: `${config.panelCount} x ${panel.brand} ${panel.model}`,
        amount: panel.price * config.panelCount,
      });
    }

    // Battery cost
    if (battery && config.batteryCount > 0) {
      items.push({
        label: "Battery Storage",
        detail: `${config.batteryCount} x ${battery.brand} ${battery.model}`,
        amount: battery.price * config.batteryCount,
      });
    }

    // Inverter cost
    if (inverter) {
      items.push({
        label: "Inverter",
        detail: `${inverter.brand} ${inverter.model}`,
        amount: inverter.price,
      });
    }

    // Turbine cost
    if (turbine && config.turbineCount > 0) {
      items.push({
        label: "Wind Turbines",
        detail: `${config.turbineCount} x ${turbine.brand} ${turbine.model}`,
        amount: turbine.price * config.turbineCount,
      });
    }

    // Installation cost (solar/wind)
    const totalWattage =
      (panel ? panel.wattage * config.panelCount : 0) +
      (turbine ? turbine.ratedPowerW * config.turbineCount : 0);
    const installationCost = totalWattage * INSTALLATION_COST_PER_WATT;

    if (installationCost > 0) {
      items.push({
        label: "Solar/Wind Installation",
        detail: `${(totalWattage / 1000).toFixed(1)} kW @ $${INSTALLATION_COST_PER_WATT}/W`,
        amount: installationCost,
      });
    }

    const totalCost = items.reduce((sum, item) => sum + item.amount, 0);
    const taxCreditRate = REGIONS[config.country].taxCreditRate;
    const taxCredit = taxCreditRate > 0 ? totalCost * taxCreditRate : 0;
    const effectiveCost = totalCost - taxCredit;

    return { items, totalCost, taxCredit, effectiveCost };
  }, [config]);

  const currency = REGIONS[config.country].currency;
  const hasItems = breakdown.items.length > 0;

  if (!hasItems) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5 text-green-600" />
            Cost Breakdown
          </CardTitle>
          <CardDescription>
            Select equipment above to see itemized costs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No equipment selected yet. Choose solar panels, batteries, and an
            inverter to see the cost breakdown.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="size-5 text-green-600" />
          Cost Breakdown
        </CardTitle>
        <CardDescription>
          Itemized equipment and installation costs for your system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakdown.items.map((item) => (
              <TableRow key={item.label}>
                <TableCell className="font-medium">{item.label}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.detail}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.amount, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-semibold">
                Total System Cost
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(breakdown.totalCost, currency)}
              </TableCell>
            </TableRow>
            {breakdown.taxCredit > 0 && (
              <>
                <TableRow className="text-green-700 dark:text-green-400">
                  <TableCell colSpan={2}>
                    Tax Credit ({Math.round(REGIONS[config.country].taxCreditRate * 100)}%)
                  </TableCell>
                  <TableCell className="text-right">
                    -{formatCurrency(breakdown.taxCredit, currency)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} className="font-bold">
                    Effective Cost After Credits
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(breakdown.effectiveCost, currency)}
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
