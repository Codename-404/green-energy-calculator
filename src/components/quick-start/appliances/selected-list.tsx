"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import * as LucideIcons from "lucide-react";
import {
  Minus,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Package,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { APPLIANCE_BY_ID } from "@/lib/appliance-load";
import {
  applianceSelectionsAtom,
  customAppliancesAtom,
} from "@/store/atoms";
import type {
  Appliance,
  ApplianceSelection,
  CustomAppliance,
} from "@/types/appliance";

function resolveIcon(name: string): LucideIcon {
  const record = LucideIcons as unknown as Record<string, LucideIcon>;
  return record[name] ?? LucideIcons.Zap;
}

export function SelectedList() {
  const [selections, setSelections] = useAtom(applianceSelectionsAtom);
  const [customs, setCustoms] = useAtom(customAppliancesAtom);

  const activeSelections = selections.filter((s) => s.quantity > 0);

  if (activeSelections.length === 0 && customs.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="max-h-[55vh] divide-y overflow-y-auto">
          {activeSelections.map((sel) => {
            const a = APPLIANCE_BY_ID[sel.applianceId];
            if (!a) return null;
            return (
              <CatalogRow
                key={sel.applianceId}
                appliance={a}
                selection={sel}
                onUpdate={(patch) =>
                  setSelections((prev) =>
                    prev.map((s) =>
                      s.applianceId === sel.applianceId ? { ...s, ...patch } : s,
                    ),
                  )
                }
                onRemove={() =>
                  setSelections((prev) =>
                    prev.filter((s) => s.applianceId !== sel.applianceId),
                  )
                }
              />
            );
          })}
          {customs.map((c) => (
            <CustomRow
              key={c.id}
              item={c}
              onUpdate={(patch) =>
                setCustoms((prev) =>
                  prev.map((x) => (x.id === c.id ? { ...x, ...patch } : x)),
                )
              }
              onRemove={() =>
                setCustoms((prev) => prev.filter((x) => x.id !== c.id))
              }
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface CatalogRowProps {
  appliance: Appliance;
  selection: ApplianceSelection;
  onUpdate: (
    patch: Partial<{
      quantity: number;
      wattsOverride: number;
      hoursOverride: number;
    }>,
  ) => void;
  onRemove: () => void;
}

function CatalogRow({
  appliance,
  selection,
  onUpdate,
  onRemove,
}: CatalogRowProps) {
  const [expanded, setExpanded] = useState(false);
  const qty = selection.quantity;
  const watts = selection.wattsOverride ?? appliance.watts;
  const hours = selection.hoursOverride ?? appliance.hoursPerDay;
  const Icon = resolveIcon(appliance.icon);

  return (
    <li>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{appliance.name}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {watts} W · {hours}h/day ·{" "}
            <span className="text-foreground">
              {((qty * watts * hours * (appliance.dutyCycle ?? 1)) / 1000).toFixed(2)} kWh/day
            </span>
          </p>
        </div>

        <Stepper
          qty={qty}
          onDec={() => {
            if (qty <= 1) onRemove();
            else onUpdate({ quantity: qty - 1 });
          }}
          onInc={() => onUpdate({ quantity: qty + 1 })}
          label={appliance.name}
        />

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? "Hide settings" : "Tweak settings"}
        >
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Remove ${appliance.name}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {expanded && (
        <div className="grid gap-4 border-t bg-muted/20 px-4 py-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor={`w-${appliance.id}`}
              className="text-xs text-muted-foreground"
            >
              Watts per unit
            </Label>
            <Input
              id={`w-${appliance.id}`}
              type="number"
              min={1}
              value={watts}
              onChange={(e) =>
                onUpdate({
                  wattsOverride: Math.max(1, Number(e.target.value) || 0),
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Hours per day
              </Label>
              <span className="text-xs font-medium tabular-nums">{hours}h</span>
            </div>
            <Slider
              min={0}
              max={24}
              step={0.5}
              value={[hours]}
              onValueChange={(v) =>
                onUpdate({
                  hoursOverride: Array.isArray(v) ? v[0] : v,
                })
              }
              aria-label={`${appliance.name} hours per day`}
            />
          </div>
        </div>
      )}
    </li>
  );
}

interface CustomRowProps {
  item: CustomAppliance;
  onUpdate: (patch: Partial<CustomAppliance>) => void;
  onRemove: () => void;
}

function CustomRow({ item, onUpdate, onRemove }: CustomRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Package className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {item.name}
            <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
              custom
            </span>
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {item.watts} W · {item.hoursPerDay}h/day ·{" "}
            <span className="text-foreground">
              {((item.quantity * item.watts * item.hoursPerDay) / 1000).toFixed(2)} kWh/day
            </span>
          </p>
        </div>

        <Stepper
          qty={item.quantity}
          onDec={() => {
            if (item.quantity <= 1) onRemove();
            else onUpdate({ quantity: item.quantity - 1 });
          }}
          onInc={() => onUpdate({ quantity: item.quantity + 1 })}
          label={item.name}
        />

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? "Hide settings" : "Edit"}
        >
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Remove ${item.name}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {expanded && (
        <div className="grid gap-4 border-t bg-muted/20 px-4 py-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Watts</Label>
            <Input
              type="number"
              min={1}
              value={item.watts}
              onChange={(e) =>
                onUpdate({ watts: Math.max(1, Number(e.target.value) || 0) })
              }
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Hours per day
              </Label>
              <span className="text-xs font-medium tabular-nums">
                {item.hoursPerDay}h
              </span>
            </div>
            <Slider
              min={0}
              max={24}
              step={0.5}
              value={[item.hoursPerDay]}
              onValueChange={(v) =>
                onUpdate({
                  hoursPerDay: Array.isArray(v) ? v[0] : v,
                })
              }
              aria-label={`${item.name} hours per day`}
            />
          </div>
        </div>
      )}
    </li>
  );
}

function Stepper({
  qty,
  onDec,
  onInc,
  label,
}: {
  qty: number;
  onDec: () => void;
  onInc: () => void;
  label: string;
}) {
  return (
    <div className={cn("flex items-center gap-1")}>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onDec}
        aria-label={`Decrease ${label}`}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="min-w-6 text-center text-sm font-semibold tabular-nums">
        {qty}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onInc}
        aria-label={`Increase ${label}`}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
