import { describe, expect, test } from "vitest";
import { calculateWindProduction } from "./wind-calculations";
import { makeClimatology } from "./__fixtures__/climatology";

const baseInput = {
  latitude: 40,
  longitude: -100,
  turbineRatedPower: 5000, // 5 kW small turbine
  rotorDiameter: 5.5,
  hubHeight: 30,
  cutInSpeed: 2.5,
  ratedSpeed: 11,
  cutOutSpeed: 25,
  terrainType: "open" as const,
};

describe("calculateWindProduction", () => {
  test("returns zero output below cut-in speed", () => {
    const calm = makeClimatology({ latitude: 40, longitude: -100, windSpeed: 1 });
    const result = calculateWindProduction(baseInput, calm);

    expect(result.annualProduction).toBe(0);
    expect(result.capacityFactor).toBe(0);
  });

  test("caps electrical output at rated power above ratedSpeed", () => {
    // 10 m/s at 2m extrapolates to ~14.6 m/s at 30m — above rated (11) but
    // below cut-out (25). Production should saturate near nameplate.
    const strong = makeClimatology({ latitude: 40, longitude: -100, windSpeed: 10 });
    const result = calculateWindProduction(baseInput, strong);

    expect(result.capacityFactor).toBeLessThanOrEqual(1);
    expect(result.capacityFactor).toBeGreaterThan(0.9);
  });

  test("shuts down above cut-out speed", () => {
    // 20 m/s at 2m extrapolates to ~29 m/s at 30m — above cut-out.
    const hurricane = makeClimatology({ latitude: 40, longitude: -100, windSpeed: 20 });
    const result = calculateWindProduction(baseInput, hurricane);

    expect(result.annualProduction).toBe(0);
  });

  test("urban terrain produces less than open terrain at same WS2M", () => {
    const wind = makeClimatology({ latitude: 40, longitude: -100, windSpeed: 6 });

    const open = calculateWindProduction(baseInput, wind);
    const urban = calculateWindProduction(
      { ...baseInput, terrainType: "urban" },
      wind,
    );

    expect(open.annualProduction).toBeGreaterThan(urban.annualProduction);
  });

  test("higher hub height extracts more power", () => {
    const wind = makeClimatology({ latitude: 40, longitude: -100, windSpeed: 5 });

    const low = calculateWindProduction({ ...baseInput, hubHeight: 10 }, wind);
    const high = calculateWindProduction({ ...baseInput, hubHeight: 50 }, wind);

    expect(high.annualProduction).toBeGreaterThan(low.annualProduction);
  });

  test("annual production equals sum of monthly breakdown", () => {
    const wind = makeClimatology({ latitude: 40, longitude: -100, windSpeed: 6 });
    const result = calculateWindProduction(baseInput, wind);

    const summed = result.monthlyBreakdown.reduce(
      (s, m) => s + m.monthlyProduction,
      0,
    );
    expect(result.annualProduction).toBeCloseTo(summed, 6);
  });
});
