"use client";

import { useEffect, useRef, useState } from "react";
import { atom, useAtomValue, useStore } from "jotai";
import {
  applianceSelectionsAtom,
  customAppliancesAtom,
  locationAtom,
  quickStartPreferencesAtom,
  quickStartCountryAtom,
} from "@/store/atoms";
import { REGIONS, type RegionKey } from "@/lib/constants";
import type {
  GridMode,
  BudgetTier,
  QuickStartPreferences,
} from "@/types/quick-start";
import type { ApplianceSelection } from "@/types/appliance";

/**
 * Bidirectional URL ↔ state sync for the Quick Start flow.
 *
 * Phase 1 (mount): URL → atoms + wizard step
 * Phase 2 (post-hydration): atoms + step → URL (debounced replaceState)
 *
 * Out of scope (v1): custom appliances. Their free-form names complicate
 * encoding; receivers get bare standard selections, which covers the
 * shareable-config use case.
 */

const STEP_NAMES = ["appliances", "location", "preferences", "results"] as const;
type StepName = (typeof STEP_NAMES)[number];

const GRID_TO_URL: Record<GridMode, "on" | "off"> = {
  "grid-tied": "on",
  "off-grid": "off",
};
const URL_TO_GRID: Record<string, GridMode> = {
  on: "grid-tied",
  off: "off-grid",
};

const BUDGET_TIERS: readonly BudgetTier[] = ["budget", "balanced", "premium"];

const DEFAULTS = {
  gridMode: "grid-tied" as GridMode,
  backupDays: 1,
  budgetTier: "balanced" as BudgetTier,
  reserveMargin: 0.1,
  country: "us" as RegionKey,
};

interface Options {
  step: number;
  setStep: (step: number) => void;
}

export function useQuickStartUrlSync({ step, setStep }: Options) {
  const store = useStore();
  const isHydratedRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [urlLat, setUrlLat] = useState<number | null>(null);
  const [urlLng, setUrlLng] = useState<number | null>(null);

  // ── Phase 1: URL → state (once on mount) ───────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") {
      isHydratedRef.current = true;
      setIsHydrated(true);
      return;
    }
    const params = new URLSearchParams(window.location.search);

    const rawApp = params.get("app");
    if (rawApp) {
      const selections = parseSelections(rawApp);
      if (selections.length > 0) {
        store.set(applianceSelectionsAtom, selections);
      }
    }

    const rawLat = params.get("lat");
    const rawLng = params.get("lng");
    if (rawLat && rawLng) {
      const lat = parseFloat(rawLat);
      const lng = parseFloat(rawLng);
      if (isValidLat(lat) && isValidLng(lng)) {
        setUrlLat(lat);
        setUrlLng(lng);
      }
    }

    const prefs: QuickStartPreferences = {
      ...store.get(quickStartPreferencesAtom),
    };
    const grid = params.get("grid");
    if (grid && URL_TO_GRID[grid]) prefs.gridMode = URL_TO_GRID[grid];
    const bd = params.get("bd");
    if (bd) {
      const n = parseInt(bd, 10);
      if (Number.isFinite(n) && n >= 1 && n <= 3) prefs.backupDays = n;
    }
    const bt = params.get("bt");
    if (bt && BUDGET_TIERS.includes(bt as BudgetTier)) {
      prefs.budgetTier = bt as BudgetTier;
    }
    const rm = params.get("rm");
    if (rm) {
      const n = parseFloat(rm);
      if (Number.isFinite(n) && n >= 0 && n <= 0.5) prefs.reserveMargin = n;
    }
    store.set(quickStartPreferencesAtom, prefs);

    const c = params.get("c");
    if (c && c in REGIONS) {
      store.set(quickStartCountryAtom, c as RegionKey);
    }

    // Step last — clamp to 0 if no selections so receivers don't land on a
    // mid-flow step with empty state.
    const rawStep = params.get("step");
    if (rawStep) {
      const idx = STEP_NAMES.indexOf(rawStep as StepName);
      if (idx > 0) {
        const selections = store.get(applianceSelectionsAtom);
        const customs = store.get(customAppliancesAtom);
        const activeCount =
          selections.filter((s) => s.quantity > 0).length + customs.length;
        if (activeCount > 0) setStep(idx);
      }
    }

    isHydratedRef.current = true;
    setIsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Phase 2: state → URL (after hydration, debounced) ──────────────────
  const [urlStringAtom] = useState(() =>
    atom((get) => {
      const params = new URLSearchParams();

      const selections = get(applianceSelectionsAtom);
      const active = selections.filter((s) => s.quantity > 0);
      if (active.length > 0) {
        params.set("app", serializeSelections(active));
      }

      const loc = get(locationAtom);
      if (loc) {
        params.set("lat", loc.coordinates.latitude.toFixed(4));
        params.set("lng", loc.coordinates.longitude.toFixed(4));
      }

      const prefs = get(quickStartPreferencesAtom);
      if (prefs.gridMode !== DEFAULTS.gridMode) {
        params.set("grid", GRID_TO_URL[prefs.gridMode]);
      }
      if (prefs.backupDays !== DEFAULTS.backupDays) {
        params.set("bd", String(prefs.backupDays));
      }
      if (prefs.budgetTier !== DEFAULTS.budgetTier) {
        params.set("bt", prefs.budgetTier);
      }
      if (prefs.reserveMargin !== DEFAULTS.reserveMargin) {
        params.set("rm", prefs.reserveMargin.toFixed(2));
      }

      const country = get(quickStartCountryAtom);
      if (country !== DEFAULTS.country) params.set("c", country);

      return params.toString();
    }),
  );

  const urlString = useAtomValue(urlStringAtom);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!isHydratedRef.current) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(urlString);
      if (step > 0) params.set("step", STEP_NAMES[step]);

      const qs = params.toString();
      const target = qs
        ? `${window.location.pathname}?${qs}`
        : window.location.pathname;

      if (target !== window.location.pathname + window.location.search) {
        window.history.replaceState(null, "", target);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [urlString, step]);

  return { isHydrated, urlLat, urlLng };
}

// ── Codecs ────────────────────────────────────────────────────────────────

function serializeSelections(active: ApplianceSelection[]): string {
  return active.map((s) => `${s.applianceId}:${s.quantity}`).join(",");
}

function parseSelections(raw: string): ApplianceSelection[] {
  const out: ApplianceSelection[] = [];
  for (const part of raw.split(",")) {
    const [id, qtyRaw] = part.split(":");
    if (!id) continue;
    const q = parseInt(qtyRaw ?? "1", 10);
    if (!Number.isFinite(q) || q < 1 || q > 99) continue;
    out.push({ applianceId: id, quantity: q });
  }
  return out;
}

function isValidLat(n: number) {
  return Number.isFinite(n) && n >= -90 && n <= 90;
}
function isValidLng(n: number) {
  return Number.isFinite(n) && n >= -180 && n <= 180;
}
