"use client";

import { useCallback } from "react";
import { useAtom } from "jotai";
import { comparisonIdsAtom } from "@/store/atoms";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatPower,
  formatPercent,
  formatCurrency,
  formatWindSpeed,
} from "@/lib/formatters";
import { Star, GitCompareArrows, ExternalLink } from "lucide-react";
import type {
  SolarPanel,
  Battery,
  WindTurbine,
  Inverter,
  AnyEquipment,
  EquipmentCategory,
} from "@/types/equipment";

/** Detect the equipment category from the item shape */
function detectCategory(item: AnyEquipment): EquipmentCategory {
  if ("wattage" in item && "efficiency" in item && "technology" in item)
    return "panels";
  if ("capacityKwh" in item && "chemistry" in item) return "batteries";
  if ("rotorDiameter" in item && "cutInSpeed" in item) return "turbines";
  if ("mpptChannels" in item) return "inverters";
  return "panels";
}

/** Render star rating */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3 ${
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

/** Render specs based on equipment category */
function EquipmentSpecs({
  item,
  category,
}: {
  item: AnyEquipment;
  category: EquipmentCategory;
}) {
  switch (category) {
    case "panels": {
      const panel = item as SolarPanel;
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>
            <span className="text-muted-foreground/50">Power:</span>{" "}
            <span className="font-semibold">{panel.wattage}W</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">Efficiency:</span>{" "}
            <span className="font-semibold">{formatPercent(panel.efficiency)}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">Technology:</span>{" "}
            <span className="font-semibold capitalize">{panel.technology}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">Warranty:</span>{" "}
            <span className="font-semibold">{panel.warrantyYears}yr</span>
          </div>
        </div>
      );
    }
    case "batteries": {
      const battery = item as Battery;
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>
            <span className="text-muted-foreground/50">Capacity:</span>{" "}
            <span className="font-semibold">{battery.capacityKwh} kWh</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">Voltage:</span>{" "}
            <span className="font-semibold">{battery.voltage}V</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">Chemistry:</span>{" "}
            <span className="font-semibold uppercase">{battery.chemistry}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">Cycles:</span>{" "}
            <span className="font-semibold">{battery.cycleLife.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    case "turbines": {
      const turbine = item as WindTurbine;
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>
            <span className="text-muted-foreground/50">Power:</span>{" "}
            <span className="font-semibold">{formatPower(turbine.ratedPowerW)}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">Rotor:</span>{" "}
            <span className="font-semibold">{turbine.rotorDiameter}m</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">Cut-in:</span>{" "}
            <span className="font-semibold">{formatWindSpeed(turbine.cutInSpeed)}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">Type:</span>{" "}
            <span className="font-semibold uppercase">{turbine.type}</span>
          </div>
        </div>
      );
    }
    case "inverters": {
      const inverter = item as Inverter;
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>
            <span className="text-muted-foreground/50">Power:</span>{" "}
            <span className="font-semibold">{formatPower(inverter.ratedPowerW)}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">Efficiency:</span>{" "}
            <span className="font-semibold">{formatPercent(inverter.efficiency)}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">Type:</span>{" "}
            <span className="font-semibold capitalize">{inverter.type}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50">MPPT:</span>{" "}
            <span className="font-semibold">{inverter.mpptChannels} ch</span>
          </div>
        </div>
      );
    }
  }
}

interface EquipmentCardProps {
  item: AnyEquipment;
  category?: EquipmentCategory;
}

export function EquipmentCard({ item, category }: EquipmentCardProps) {
  const [comparisonIds, setComparisonIds] = useAtom(comparisonIdsAtom);
  const resolvedCategory = category ?? detectCategory(item);
  const isComparing = comparisonIds.includes(item.id);

  const toggleCompare = useCallback(() => {
    setComparisonIds((ids) => {
      if (ids.includes(item.id)) {
        return ids.filter((id) => id !== item.id);
      }
      if (ids.length >= 3) return ids; // max 3
      return [...ids, item.id];
    });
  }, [item.id, setComparisonIds]);

  return (
    <Card className="flex flex-col transition-all hover:shadow-md hover:border-primary/20">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
        <Image
          src={item.imageUrl}
          alt={`${item.brand} ${item.model}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {item.brand}
            </p>
            <CardTitle className="text-sm leading-snug">{item.model}</CardTitle>
          </div>
          <p className="shrink-0 text-base font-bold text-primary">
            {formatCurrency(item.price)}
          </p>
        </div>
        <StarRating rating={item.rating} />
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Specs */}
        <EquipmentSpecs item={item} category={resolvedCategory} />

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-[10px]">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant={isComparing ? "default" : "outline"}
          size="sm"
          onClick={toggleCompare}
          disabled={!isComparing && comparisonIds.length >= 3}
          className="flex-1"
          aria-label={
            isComparing
              ? `Remove ${item.model} from comparison`
              : `Add ${item.model} to comparison`
          }
        >
          <GitCompareArrows className="size-3.5" />
          {isComparing ? "Comparing" : "Compare"}
        </Button>
        <Link
          href={`/equipment/${item.slug}`}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          aria-label={`View details for ${item.brand} ${item.model}`}
        >
          Details
          <ExternalLink className="size-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
