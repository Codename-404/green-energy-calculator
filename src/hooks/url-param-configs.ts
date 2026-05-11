import type { PrimitiveAtom } from "jotai";
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

type WAtom<T> = PrimitiveAtom<T>;

export interface ParamConfig<T = unknown> {
  /** Short URL key */
  key: string;
  /** Jotai atom to sync */
  atom: WAtom<T>;
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

// `ParamConfig` is invariant in T because T appears in both producer and
// consumer positions (atom write, serialize input). The factory helpers
// preserve the per-entry type, so the upcast to `ParamConfig<unknown>` at
// array-assembly time is safe — each entry's atom + serialize + deserialize
// always agree on the same concrete T at runtime.
type AnyParamConfig = ParamConfig<unknown>;
const erase = <T>(c: ParamConfig<T>): AnyParamConfig => c as AnyParamConfig;

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

function numberParam(
  key: string,
  atom: WAtom<number>,
  defaultValue: number,
  opts?: { min?: number; max?: number; decimals?: number },
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
  atom: WAtom<T>,
  defaultValue: T,
  validValues: readonly T[],
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
  atom: WAtom<string | null>,
): ParamConfig<string | null> {
  return {
    key,
    atom,
    defaultValue: null,
    serialize: (v) => v ?? "",
    deserialize: (raw) => (raw ? raw : null),
  };
}

// ---------------------------------------------------------------------------
// Per-calculator configs
// ---------------------------------------------------------------------------

const SOLAR_CONFIGS: AnyParamConfig[] = [
  erase(
    enumParam("m", solarInputModeAtom, "technology", [
      "technology",
      "product",
    ] as const),
  ),
  erase(
    enumParam("t", solarTechnologyAtom, "monocrystalline", [
      "monocrystalline",
      "polycrystalline",
      "thin-film",
      "bifacial",
    ] as const),
  ),
  erase(numberParam("w", solarWattageTierAtom, 400, { min: 100, max: 800 })),
  erase(nullableStringParam("pid", selectedPanelIdAtom)),
  erase(
    numberParam("n", panelCountAtom, DEFAULT_PANEL_COUNT, { min: 1, max: 100 }),
  ),
  erase(
    numberParam("tl", tiltAngleAtom, DEFAULT_TILT_ANGLE, { min: 0, max: 90 }),
  ),
  erase(
    numberParam("az", azimuthAtom, DEFAULT_AZIMUTH, { min: 0, max: 360 }),
  ),
  erase(
    numberParam("sf", shadingFactorAtom, DEFAULT_SHADING_FACTOR, {
      min: 0,
      max: 1,
      decimals: 2,
    }),
  ),
  erase(
    numberParam("sl", systemLossesAtom, DEFAULT_SYSTEM_LOSSES, {
      min: 0,
      max: 0.5,
      decimals: 2,
    }),
  ),
];

const WIND_CONFIGS: AnyParamConfig[] = [
  erase(
    enumParam("m", windInputModeAtom, "technology", [
      "technology",
      "product",
    ] as const),
  ),
  erase(enumParam("t", windTurbineTypeAtom, "hawt", ["hawt", "vawt"] as const)),
  erase(numberParam("w", windPowerTierAtom, 5000, { min: 100, max: 100000 })),
  erase(nullableStringParam("pid", selectedTurbineIdAtom)),
  erase(numberParam("n", turbineCountAtom, 1, { min: 1, max: 50 })),
  erase(numberParam("hh", hubHeightAtom, 30, { min: 5, max: 200 })),
  erase(
    enumParam("tr", terrainTypeAtom, "suburban", [
      "open",
      "suburban",
      "urban",
      "coastal",
    ] as const),
  ),
];

const CONFIG_MAP: Record<CalculatorType, AnyParamConfig[]> = {
  solar: SOLAR_CONFIGS,
  wind: WIND_CONFIGS,
};

export function getParamConfigs(type: CalculatorType): AnyParamConfig[] {
  return CONFIG_MAP[type];
}
