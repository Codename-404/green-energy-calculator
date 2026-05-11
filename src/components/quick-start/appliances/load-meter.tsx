"use client";

import { useAtomValue } from "jotai";
import { Zap, Gauge, Calendar, ShoppingBasket } from "lucide-react";
import { loadProfileAtom } from "@/store/atoms";
import { useAnimatedNumber } from "@/hooks/use-animated-number";

function fmt(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

interface StatProps {
  icon: typeof Zap;
  label: string;
  value: number;
  digits: number;
  unit: string;
  color: string;
  index: number;
}

function Stat({ icon: Icon, label, value, digits, unit, color, index }: StatProps) {
  const animated = useAnimatedNumber(value);
  return (
    <div className={`flex flex-col gap-1 ${index > 0 ? "sm:pl-4" : ""}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className={`size-4 ${color}`} />
        {label}
      </div>
      <p className="text-xl font-bold leading-tight tabular-nums">
        {fmt(animated, digits)}
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          {unit}
        </span>
      </p>
    </div>
  );
}

export function LoadMeter() {
  const profile = useAtomValue(loadProfileAtom);

  const stats = [
    {
      icon: Zap,
      label: "Daily",
      value: profile.dailyKwh,
      digits: 2,
      unit: "kWh",
      color: "text-amber-500",
    },
    {
      icon: Gauge,
      label: "Peak",
      value: profile.continuousKw,
      digits: 2,
      unit: "kW",
      color: "text-primary",
    },
    {
      icon: Calendar,
      label: "Annual",
      value: profile.annualKwh,
      digits: 0,
      unit: "kWh",
      color: "text-emerald-500",
    },
    {
      icon: ShoppingBasket,
      label: "Items",
      value: profile.itemCount,
      digits: 0,
      unit: "units",
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-accent/30 p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:divide-x sm:divide-border/40">
        {stats.map((s, i) => (
          <Stat
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            digits={s.digits}
            unit={s.unit}
            color={s.color}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
