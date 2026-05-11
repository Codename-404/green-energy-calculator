import { describe, expect, test } from "vitest";
import { calculateSolarProduction } from "./solar-calculations";
import { makeClimatology } from "./__fixtures__/climatology";

const baseInput = {
  latitude: 35,
  longitude: -120,
  panelWattage: 400,
  panelEfficiency: 0.21,
  panelCount: 10,
  tiltAngle: 30,
  azimuth: 180,
  shadingFactor: 1,
  systemLosses: 0.14,
  temperatureCoefficient: -0.35, // %/°C, typical mono panel
};

describe("calculateSolarProduction", () => {
  test("annual production scales linearly with panel count", () => {
    const climatology = makeClimatology({ latitude: 35, longitude: -120 });

    const ten = calculateSolarProduction(baseInput, climatology);
    const twenty = calculateSolarProduction(
      { ...baseInput, panelCount: 20 },
      climatology,
    );

    expect(twenty.annualProduction / ten.annualProduction).toBeCloseTo(2, 5);
  });

  test("south-facing array outproduces north-facing in northern hemisphere", () => {
    const climatology = makeClimatology({ latitude: 40, longitude: 0 });

    const south = calculateSolarProduction(baseInput, climatology);
    const north = calculateSolarProduction(
      { ...baseInput, azimuth: 0 },
      climatology,
    );

    expect(south.annualProduction).toBeGreaterThan(north.annualProduction);
  });

  test("higher temperature derates output (negative tempCoeff)", () => {
    const cool = makeClimatology({ latitude: 35, longitude: -120, temperature: 10 });
    const hot = makeClimatology({ latitude: 35, longitude: -120, temperature: 40 });

    const cold = calculateSolarProduction(baseInput, cool);
    const warm = calculateSolarProduction(baseInput, hot);

    expect(cold.annualProduction).toBeGreaterThan(warm.annualProduction);
  });

  test("specific yield falls within plausible PV range (800-2200 kWh/kWp/yr)", () => {
    const climatology = makeClimatology({
      latitude: 35,
      longitude: -120,
      irradiance: 5.5,
    });

    const result = calculateSolarProduction(baseInput, climatology);

    expect(result.specificYield).toBeGreaterThan(800);
    expect(result.specificYield).toBeLessThan(2200);
  });

  test("performanceRatio equals 1 - systemLosses", () => {
    const climatology = makeClimatology({ latitude: 35, longitude: -120 });

    const result = calculateSolarProduction(
      { ...baseInput, systemLosses: 0.18 },
      climatology,
    );

    expect(result.performanceRatio).toBeCloseTo(0.82, 5);
  });
});
