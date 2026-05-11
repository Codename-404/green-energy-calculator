"use client";

import { useEffect, useRef, useState } from "react";
import { atom, useAtomValue, useStore } from "jotai";
import { locationAtom } from "@/store/atoms";
import type { ParamConfig, CalculatorType } from "./url-param-configs";
import { getParamConfigs } from "./url-param-configs";

/**
 * Bidirectional URL ↔ Jotai atom sync for calculator pages.
 *
 * Phase 1 (mount): reads URL search params → sets atoms
 * Phase 2 (post-hydration): subscribes to atom changes → writes URL
 *
 * Returns `urlLat` / `urlLng` so `useLocationHydration` can trigger data fetch.
 */
export function useUrlSync(calculatorType: CalculatorType) {
  const store = useStore();
  const configs = getParamConfigs(calculatorType);
  const isHydratedRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [urlLat, setUrlLat] = useState<number | null>(null);
  const [urlLng, setUrlLng] = useState<number | null>(null);

  // Stable derived atom that serialises all param values + location to a query string.
  // Created once via useState initialiser — configs is a module-level constant so the
  // closure is safe.
  const [urlStringAtom] = useState(() =>
    atom((get) => {
      const entries: [string, string][] = [];

      // Location
      const loc = get(locationAtom);
      if (loc) {
        entries.push(["lat", loc.coordinates.latitude.toFixed(4)]);
        entries.push(["lng", loc.coordinates.longitude.toFixed(4)]);
      }

      // Calculator-specific params — omit defaults
      for (const cfg of configs) {
        const value = get(cfg.atom);
        if (value === null || value === undefined) continue;
        const serialised = cfg.serialize(value);
        const defaultSerialised = cfg.serialize(cfg.defaultValue);
        if (serialised === defaultSerialised) continue;
        entries.push([cfg.key, serialised]);
      }

      return entries.length > 0
        ? new URLSearchParams(entries).toString()
        : "";
    })
  );

  // ── Phase 1: Hydrate atoms from URL (once on mount) ─────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.size === 0) {
      isHydratedRef.current = true;
      setIsHydrated(true);
      return;
    }

    // Parse lat/lng for location hydration
    const rawLat = params.get("lat");
    const rawLng = params.get("lng");
    if (rawLat && rawLng) {
      const lat = parseFloat(rawLat);
      const lng = parseFloat(rawLng);
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        setUrlLat(lat);
        setUrlLng(lng);
      }
    }

    // Parse calculator-specific params
    for (const cfg of configs) {
      const raw = params.get(cfg.key);
      if (raw === null) continue;
      const parsed = cfg.deserialize(raw);
      if (parsed === null) continue;
      if (cfg.validate && !cfg.validate(parsed)) continue;
      store.set(cfg.atom, parsed);
    }

    isHydratedRef.current = true;
    setIsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Phase 2: Atoms → URL (after hydration) ──────────────────────────────
  const urlString = useAtomValue(urlStringAtom);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!isHydratedRef.current) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const target = urlString
        ? `${window.location.pathname}?${urlString}`
        : window.location.pathname;

      if (target !== window.location.pathname + window.location.search) {
        window.history.replaceState(null, "", target);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [urlString]);

  return { isHydrated, urlLat, urlLng };
}
