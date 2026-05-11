import type { WritableAtom } from "jotai";
import {
  solarInputModeAtom,
  solarTechnologyAtom,
  solarWattageTierAtom,
  selectedPanelIdAtom,
  panelCountAtom,
  tiltAngleAtom,
  azimuthAtom,
  shadingFactorAtom,
  systemLossesAtom,
  windInputModeAtom,
  windTurbineTypeAtom,
  windPowerTierAtom,
  selectedTurbineIdAtom,
  turbineCountAtom,
  hubHeightAtom,
  terrainTypeAtom,
} from "@/store/atoms";
import {
  DEFAULT_PANEL_COUNT,
  DEFAULT_TILT_ANGLE,
  DEFAULT_AZIMUTH,
  DEFAULT_SHADING_FACTOR,
  DEFAULT_SYSTEM_LOSSES,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParamConfig<T = unknown> {
  /** Short URL key */
  key: string;
  /** Jotai atom to sync */
  atom: WritableAtom<T, [T], void>;
  /** Default value — if atom matches, omit from URL */
  defaultValue: T;
  /** Serialize atom value to URL string */
  serialize: (value: T) => string;
  /** Parse URL string back to value. Returns null on failure. */
  deserialize: (raw: string) => T | null;
  /** Optional range / set validation */
  validate?: (value: T) => boolean;
}

export type CalculatorType = "solar" | "wind";

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function numberParam(
  key: string,
  atom: any,
  defaultValue: number,
  opts?: { min?: number; max?: number; decimals?: number }
): ParamConfig<number> {
  const { min, max, decimals } = opts ?? {};
  return {
    key,
    atom,
    defaultValue,
    serialize: (v) => (decimals != null ? v.toFixed(decimals) : String(v)),
    deserialize: (raw) => {
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    },
    validate: (v) => {
      if (min != null && v < min) return false;
      if (max != null && v > max) return false;
      return true;
    },
  };
}

function enumParam<T extends string>(
  key: string,
  atom: any,
  defaultValue: T,
  validValues: readonly T[]
): ParamConfig<T> {
  return {
    key,
    atom,
    defaultValue,
    serialize: (v) => v,
    deserialize: (raw) =>
      validValues.includes(raw as T) ? (raw as T) : null,
  };
}

function nullableStringParam(
  key: string,
  atom: any
): ParamConfig<string | null> {
  return {
    key,
    atom,
    defaultValue: null,
    serialize: (v) => v ?? "",
    deserialize: (raw) => (raw ? raw : null),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Per-calculator configs
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
const SOLAR_CONFIGS: ParamConfig<any>[] = [
  enumParam("m", solarInputModeAtom, "technology", [
    "technology",
    "product",
  ] as const),
  enumParam("t", solarTechnologyAtom, "monocrystalline", [
    "monocrystalline",
    "polycrystalline",
    "thin-film",
    "bifacial",
  ] as const),
  numberParam("w", solarWattageTierAtom, 400, { min: 100, max: 800 }),
  nullableStringParam("pid", selectedPanelIdAtom),
  numberParam("n", panelCountAtom, DEFAULT_PANEL_COUNT, { min: 1, max: 100 }),
  numberParam("tl", tiltAngleAtom, DEFAULT_TILT_ANGLE, { min: 0, max: 90 }),
  numberParam("az", azimuthAtom, DEFAULT_AZIMUTH, { min: 0, max: 360 }),
  numberParam("sf", shadingFactorAtom, DEFAULT_SHADING_FACTOR, {
    min: 0,
    max: 1,
    decimals: 2,
  }),
  numberParam("sl", systemLossesAtom, DEFAULT_SYSTEM_LOSSES, {
    min: 0,
    max: 0.5,
    decimals: 2,
  }),
];

const WIND_CONFIGS: ParamConfig<any>[] = [
  enumParam("m", windInputModeAtom, "technology", [
    "technology",
    "product",
  ] as const),
  enumParam("t", windTurbineTypeAtom, "hawt", ["hawt", "vawt"] as const),
  numberParam("w", windPowerTierAtom, 5000, { min: 100, max: 100000 }),
  nullableStringParam("pid", selectedTurbineIdAtom),
  numberParam("n", turbineCountAtom, 1, { min: 1, max: 50 }),
  numberParam("hh", hubHeightAtom, 30, { min: 5, max: 200 }),
  enumParam("tr", terrainTypeAtom, "suburban", [
    "open",
    "suburban",
    "urban",
    "coastal",
  ] as const),
];

const CONFIG_MAP: Record<CalculatorType, ParamConfig<any>[]> = {
  solar: SOLAR_CONFIGS,
  wind: WIND_CONFIGS,
};

/* eslint-enable @typescript-eslint/no-explicit-any */

export function getParamConfigs(type: CalculatorType): ParamConfig<any>[] {
  return CONFIG_MAP[type];
}
