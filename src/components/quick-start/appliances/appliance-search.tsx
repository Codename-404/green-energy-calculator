"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import * as LucideIcons from "lucide-react";
import { Search, Plus, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { APPLIANCES } from "@/lib/appliance-load";
import {
  applianceSelectionsAtom,
  customAppliancesAtom,
} from "@/store/atoms";
import type { Appliance } from "@/types/appliance";

const MAX_RESULTS = 6;
const CUSTOM_DEFAULT_WATTS = 100;
const CUSTOM_DEFAULT_HOURS = 2;

function resolveIcon(name: string): LucideIcon {
  const record = LucideIcons as unknown as Record<string, LucideIcon>;
  return record[name] ?? LucideIcons.Zap;
}

function matches(appliance: Appliance, q: string): boolean {
  const hay = [appliance.name, ...(appliance.aliases ?? [])]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

interface Props {
  variant?: "hero" | "compact";
}

export function ApplianceSearch({ variant = "compact" }: Props) {
  const setSelections = useSetAtom(applianceSelectionsAtom);
  const setCustoms = useSetAtom(customAppliancesAtom);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHero = variant === "hero";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Appliance[];
    return APPLIANCES.filter((a) => matches(a, q)).slice(0, MAX_RESULTS);
  }, [query]);

  const trimmed = query.trim();
  const showCustomRow = trimmed.length > 0 && results.length === 0;
  const totalOptions = results.length + (showCustomRow ? 1 : 0);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const addAppliance = useCallback(
    (id: string) => {
      setSelections((prev) => {
        const idx = prev.findIndex((s) => s.applianceId === id);
        if (idx === -1) return [...prev, { applianceId: id, quantity: 1 }];
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      });
      setQuery("");
      setOpen(false);
      inputRef.current?.focus();
    },
    [setSelections],
  );

  const addCustom = useCallback(
    (name: string) => {
      const clean = name.trim();
      if (!clean) return;
      setCustoms((prev) => [
        ...prev,
        {
          id: `custom-${Date.now()}`,
          name: clean,
          watts: CUSTOM_DEFAULT_WATTS,
          hoursPerDay: CUSTOM_DEFAULT_HOURS,
          quantity: 1,
        },
      ]);
      setQuery("");
      setOpen(false);
      inputRef.current?.focus();
    },
    [setCustoms],
  );

  const commit = useCallback(() => {
    if (results.length > 0) {
      const idx = Math.min(highlight, results.length - 1);
      addAppliance(results[idx].id);
    } else if (trimmed) {
      addCustom(trimmed);
    }
  }, [results, highlight, trimmed, addAppliance, addCustom]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h + 1) % Math.max(1, totalOptions));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(
        (h) => (h - 1 + Math.max(1, totalOptions)) % Math.max(1, totalOptions),
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showHint = isHero && open && totalOptions === 0;

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "relative bg-background transition-all",
          isHero
            ? "rounded-2xl border-2 p-1.5 shadow-md"
            : "rounded-xl border-2 p-1 shadow-sm",
          open
            ? "border-primary ring-4 ring-primary/15"
            : isHero
              ? "border-primary/40 hover:border-primary/70"
              : "border-primary/25 hover:border-primary/50",
        )}
      >
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-primary",
            isHero ? "left-4 size-6" : "left-4 size-5",
          )}
        />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={
            isHero
              ? 'e.g. "fridge", "AC", "water pump"'
              : "Add more appliances…"
          }
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          aria-autocomplete="list"
          aria-expanded={open && totalOptions > 0}
          aria-controls="appliance-search-listbox"
          className={cn(
            "border-0 bg-transparent pr-4 font-medium placeholder:font-normal placeholder:text-muted-foreground/70 focus-visible:ring-0",
            isHero
              ? "h-14 pl-12 text-lg md:text-lg"
              : "h-11 pl-11 text-base md:text-base",
          )}
        />
      </div>

      {showHint && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          ↑↓ to navigate · Enter to add · Esc to close
        </p>
      )}

      {open && totalOptions > 0 && (
        <Card
          size="sm"
          className="absolute left-0 right-0 top-full z-20 mt-1 shadow-lg"
        >
          <CardContent className="p-0">
            <ul
              id="appliance-search-listbox"
              role="listbox"
              className="max-h-80 divide-y divide-border overflow-y-auto"
            >
              {results.map((a, idx) => {
                const Icon = resolveIcon(a.icon);
                const active = idx === highlight;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => addAppliance(a.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                        active ? "bg-muted" : "hover:bg-muted/50",
                      )}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.watts} W · {a.hoursPerDay}h/day
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}

              {showCustomRow && (
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected
                    onClick={() => addCustom(trimmed)}
                    className="flex w-full items-center gap-3 bg-primary/5 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Plus className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        Add &quot;{trimmed}&quot; as custom
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Defaults to {CUSTOM_DEFAULT_WATTS}W ·{" "}
                        {CUSTOM_DEFAULT_HOURS}h/day · edit after
                      </p>
                    </div>
                  </button>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
