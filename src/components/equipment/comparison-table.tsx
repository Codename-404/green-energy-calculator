"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { comparisonIdsAtom } from "@/store/atoms";
import { comparisonItemsAtom } from "@/store/derived";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatPower,
  formatPercent,
  formatCurrency,
  formatWindSpeed,
} from "@/lib/formatters";
import { X, GitCompareArrows, Trophy } from "lucide-react";
import type {
  SolarPanel,
  Battery,
  WindTurbine,
  Inverter,
  AnyEquipment,
} from "@/types/equipment";

/** Determine which category items belong to */
function getItemCategory(item: AnyEquipment) {
  if ("wattage" in item && "efficiency" in item && "technology" in item) return "panels";
  if ("capacityKwh" in item && "chemistry" in item) return "batteries";
  if ("rotorDiameter" in item && "cutInSpeed" in item) return "turbines";
  return "inverters";
}

/** Build comparison rows based on the category */
function buildRows(
  items: AnyEquipment[],
  category: string
): { label: string; values: string[]; numeric: number[]; higherIsBetter: boolean }[] {
  switch (category) {
    case "panels":
      return [
        {
          label: "Wattage",
          values: items.map((i) => `${(i as SolarPanel).wattage}W`),
          numeric: items.map((i) => (i as SolarPanel).wattage),
          higherIsBetter: true,
        },
        {
          label: "Efficiency",
          values: items.map((i) => formatPercent((i as SolarPanel).efficiency)),
          numeric: items.map((i) => (i as SolarPanel).efficiency),
          higherIsBetter: true,
        },
        {
          label: "Technology",
          values: items.map((i) => (i as SolarPanel).technology),
          numeric: items.map(() => 0),
          higherIsBetter: false,
        },
        {
          label: "Temp. Coefficient",
          values: items.map((i) => `${(i as SolarPanel).temperatureCoefficient}%/C`),
          numeric: items.map((i) => (i as SolarPanel).temperatureCoefficient),
          higherIsBetter: true, // Less negative is better
        },
        {
          label: "Weight",
          values: items.map((i) => `${(i as SolarPanel).weight} kg`),
          numeric: items.map((i) => (i as SolarPanel).weight),
          higherIsBetter: false, // lighter is better
        },
        {
          label: "Warranty",
          values: items.map((i) => `${(i as SolarPanel).warrantyYears} years`),
          numeric: items.map((i) => (i as SolarPanel).warrantyYears),
          higherIsBetter: true,
        },
        {
          label: "Price",
          values: items.map((i) => formatCurrency(i.price)),
          numeric: items.map((i) => i.price),
          higherIsBetter: false, // lower is better
        },
        {
          label: "Rating",
          values: items.map((i) => `${i.rating}/5`),
          numeric: items.map((i) => i.rating),
          higherIsBetter: true,
        },
      ];
    case "batteries":
      return [
        {
          label: "Capacity",
          values: items.map((i) => `${(i as Battery).capacityKwh} kWh`),
          numeric: items.map((i) => (i as Battery).capacityKwh),
          higherIsBetter: true,
        },
        {
          label: "Voltage",
          values: items.map((i) => `${(i as Battery).voltage}V`),
          numeric: items.map((i) => (i as Battery).voltage),
          higherIsBetter: false,
        },
        {
          label: "Chemistry",
          values: items.map((i) => (i as Battery).chemistry.toUpperCase()),
          numeric: items.map(() => 0),
          higherIsBetter: false,
        },
        {
          label: "Cycle Life",
          values: items.map((i) => (i as Battery).cycleLife.toLocaleString()),
          numeric: items.map((i) => (i as Battery).cycleLife),
          higherIsBetter: true,
        },
        {
          label: "Round-trip Eff.",
          values: items.map((i) => formatPercent((i as Battery).roundTripEfficiency)),
          numeric: items.map((i) => (i as Battery).roundTripEfficiency),
          higherIsBetter: true,
        },
        {
          label: "Weight",
          values: items.map((i) => `${(i as Battery).weight} kg`),
          numeric: items.map((i) => (i as Battery).weight),
          higherIsBetter: false,
        },
        {
          label: "Warranty",
          values: items.map((i) => `${(i as Battery).warrantyYears} years`),
          numeric: items.map((i) => (i as Battery).warrantyYears),
          higherIsBetter: true,
        },
        {
          label: "Price",
          values: items.map((i) => formatCurrency(i.price)),
          numeric: items.map((i) => i.price),
          higherIsBetter: false,
        },
        {
          label: "Rating",
          values: items.map((i) => `${i.rating}/5`),
          numeric: items.map((i) => i.rating),
          higherIsBetter: true,
        },
      ];
    case "turbines":
      return [
        {
          label: "Rated Power",
          values: items.map((i) => formatPower((i as WindTurbine).ratedPowerW)),
          numeric: items.map((i) => (i as WindTurbine).ratedPowerW),
          higherIsBetter: true,
        },
        {
          label: "Rotor Diameter",
          values: items.map((i) => `${(i as WindTurbine).rotorDiameter}m`),
          numeric: items.map((i) => (i as WindTurbine).rotorDiameter),
          higherIsBetter: true,
        },
        {
          label: "Cut-in Speed",
          values: items.map((i) => formatWindSpeed((i as WindTurbine).cutInSpeed)),
          numeric: items.map((i) => (i as WindTurbine).cutInSpeed),
          higherIsBetter: false, // lower is better
        },
        {
          label: "Rated Speed",
          values: items.map((i) => formatWindSpeed((i as WindTurbine).ratedSpeed)),
          numeric: items.map((i) => (i as WindTurbine).ratedSpeed),
          higherIsBetter: false,
        },
        {
          label: "Type",
          values: items.map((i) => (i as WindTurbine).type.toUpperCase()),
          numeric: items.map(() => 0),
          higherIsBetter: false,
        },
        {
          label: "Weight",
          values: items.map((i) => `${(i as WindTurbine).weight} kg`),
          numeric: items.map((i) => (i as WindTurbine).weight),
          higherIsBetter: false,
        },
        {
          label: "Price",
          values: items.map((i) => formatCurrency(i.price)),
          numeric: items.map((i) => i.price),
          higherIsBetter: false,
        },
        {
          label: "Rating",
          values: items.map((i) => `${i.rating}/5`),
          numeric: items.map((i) => i.rating),
          higherIsBetter: true,
        },
      ];
    default:
      // inverters
      return [
        {
          label: "Rated Power",
          values: items.map((i) => formatPower((i as Inverter).ratedPowerW)),
          numeric: items.map((i) => (i as Inverter).ratedPowerW),
          higherIsBetter: true,
        },
        {
          label: "Max Power",
          values: items.map((i) => formatPower((i as Inverter).maxPowerW)),
          numeric: items.map((i) => (i as Inverter).maxPowerW),
          higherIsBetter: true,
        },
        {
          label: "Efficiency",
          values: items.map((i) => formatPercent((i as Inverter).efficiency)),
          numeric: items.map((i) => (i as Inverter).efficiency),
          higherIsBetter: true,
        },
        {
          label: "Type",
          values: items.map((i) => (i as Inverter).type),
          numeric: items.map(() => 0),
          higherIsBetter: false,
        },
        {
          label: "MPPT Channels",
          values: items.map((i) => `${(i as Inverter).mpptChannels}`),
          numeric: items.map((i) => (i as Inverter).mpptChannels),
          higherIsBetter: true,
        },
        {
          label: "Warranty",
          values: items.map((i) => `${(i as Inverter).warrantyYears} years`),
          numeric: items.map((i) => (i as Inverter).warrantyYears),
          higherIsBetter: true,
        },
        {
          label: "Price",
          values: items.map((i) => formatCurrency(i.price)),
          numeric: items.map((i) => i.price),
          higherIsBetter: false,
        },
        {
          label: "Rating",
          values: items.map((i) => `${i.rating}/5`),
          numeric: items.map((i) => i.rating),
          higherIsBetter: true,
        },
      ];
  }
}

/** Find the index of the best value in a row */
function findBestIndex(numeric: number[], higherIsBetter: boolean): number {
  if (numeric.every((n) => n === 0)) return -1; // non-numeric row
  if (higherIsBetter) {
    const max = Math.max(...numeric);
    return numeric.indexOf(max);
  }
  const min = Math.min(...numeric);
  return numeric.indexOf(min);
}

export function ComparisonTable() {
  const items = useAtomValue(comparisonItemsAtom) as AnyEquipment[];
  const setComparisonIds = useSetAtom(comparisonIdsAtom);

  if (items.length < 2) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <GitCompareArrows className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            Select at least 2 items to compare side by side.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Use the &quot;Compare&quot; button on equipment cards.
          </p>
        </CardContent>
      </Card>
    );
  }

  const category = getItemCategory(items[0]);
  const rows = buildRows(items, category);

  const removeItem = (id: string) => {
    setComparisonIds((ids) => ids.filter((i) => i !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompareArrows className="size-5 text-primary" />
          Side-by-Side Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Spec</TableHead>
              {items.map((item) => (
                <TableHead key={item.id}>
                  <div className="flex items-center gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">
                        {item.brand}
                      </p>
                      <p className="truncate font-medium">{item.model}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.model} from comparison`}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const bestIdx = findBestIndex(row.numeric, row.higherIsBetter);
              return (
                <TableRow key={row.label}>
                  <TableCell className="text-xs font-medium text-muted-foreground">
                    {row.label}
                  </TableCell>
                  {row.values.map((val, i) => (
                    <TableCell
                      key={`${row.label}-${i}`}
                      className={
                        i === bestIdx
                          ? "font-semibold text-primary"
                          : ""
                      }
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{val}</span>
                        {i === bestIdx && (
                          <Trophy className="size-3 text-amber-500" />
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
