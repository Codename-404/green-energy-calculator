"use client";

import { DollarSign, Clock, TrendingUp, Banknote } from "lucide-react";

interface Props {
  totalCost: number;
  effectiveCost: number;
  paybackYears: number;
  netSavings25Year: number;
  currencySymbol?: string;
}

function money(n: number, sym: string) {
  if (!Number.isFinite(n)) return "—";
  return `${sym}${Math.round(n).toLocaleString()}`;
}

function k(n: number) {
  if (n < 1000) return Math.round(n).toString();
  return `${(n / 1000).toFixed(1)}k`;
}

/**
 * Cost is shown as a ±15% range to signal that our static price data
 * is indicative — real installed cost varies by installer, permitting,
 * and regional labor rates. A point estimate would read like a quote.
 */
function moneyRange(n: number, sym: string) {
  if (!Number.isFinite(n)) return "—";
  const lo = n * 0.85;
  const hi = n * 1.15;
  // Compact form: "$5.7–7.7k" reads as a range cleanly and fits a card column.
  return `${sym}${k(lo).replace("k", "")}–${k(hi)}`;
}

function years(n: number) {
  if (!Number.isFinite(n) || n > 100) return "—";
  return `${n.toFixed(1)} yr`;
}

export function CostBreakdown({
  totalCost,
  effectiveCost,
  paybackYears,
  netSavings25Year,
  currencySymbol = "$",
}: Props) {
  const items = [
    {
      icon: DollarSign,
      label: "System cost",
      value: moneyRange(totalCost, currencySymbol),
      sub: "est. before incentives",
    },
    {
      icon: Banknote,
      label: "Effective cost",
      value: moneyRange(effectiveCost, currencySymbol),
      sub: "est. after tax credit",
    },
    {
      icon: Clock,
      label: "Payback",
      value: years(paybackYears),
      sub: "simple",
    },
    {
      icon: TrendingUp,
      label: "25-yr savings",
      value: money(netSavings25Year, currencySymbol),
      sub: "net",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div
            key={it.label}
            className="rounded-lg border bg-muted/30 px-3 py-2"
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="size-3.5" />
              <dt>{it.label}</dt>
            </div>
            <dd className="mt-0.5 text-base font-bold tabular-nums">
              {it.value}
            </dd>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {it.sub}
            </p>
          </div>
        );
      })}
    </dl>
  );
}
