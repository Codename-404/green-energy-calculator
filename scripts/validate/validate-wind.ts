/**
 * Wind Power Curve Validation Script
 *
 * Validates our calculateAveragePower formula against real SCADA data
 * from Kaggle: https://www.kaggle.com/datasets/berkerisen/wind-turbine-scada-dataset
 *
 * The dataset has 10-minute interval records with:
 *   - Wind Speed (m/s) — measured at hub height
 *   - LV ActivePower (kW) — actual measured power output
 *   - Theoretical_Power_Curve (KWh) — manufacturer's expected output
 *
 * We compare OUR formula's prediction vs both actual and theoretical.
 *
 * Usage:
 *   1. Download T1.csv from Kaggle and place in scripts/validate/data/
 *   2. Run: npx tsx scripts/validate/validate-wind.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Our formula (extracted from src/lib/wind-calculations.ts) ───────────────

const WIND_GENERATOR_EFFICIENCY = 0.9;
const WIND_SYSTEM_EFFICIENCY = 0.85;

function calculateAveragePower(
  windSpeed: number,
  ratedPower: number,
  sweptArea: number,
  airDensity: number,
  cutIn: number,
  rated: number,
  cutOut: number
): number {
  if (windSpeed < cutIn || windSpeed > cutOut) return 0;
  // At/above rated speed: capped at nameplate electrical output
  if (windSpeed >= rated) return ratedPower;

  const Cp = 0.4;
  const theoreticalPower =
    0.5 *
    airDensity *
    sweptArea *
    Math.pow(windSpeed, 3) *
    Cp *
    WIND_GENERATOR_EFFICIENCY *
    WIND_SYSTEM_EFFICIENCY;

  return Math.min(theoreticalPower, ratedPower);
}

// ─── CSV Parser ──────────────────────────────────────────────────────────────

interface ScadaRow {
  windSpeed: number;
  actualPower: number;
  theoreticalPower: number;
}

function parseCsv(filePath: string): ScadaRow[] {
  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  const header = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  // Find column indices (handle different naming conventions)
  const windIdx = header.findIndex(
    (h) =>
      h.toLowerCase().includes("wind") && h.toLowerCase().includes("speed")
  );
  const powerIdx = header.findIndex(
    (h) =>
      h.toLowerCase().includes("activepower") ||
      h.toLowerCase().includes("active_power") ||
      h.toLowerCase() === "lv activepower (kw)"
  );
  const theoIdx = header.findIndex(
    (h) =>
      h.toLowerCase().includes("theoretical") ||
      h.toLowerCase().includes("power_curve")
  );

  if (windIdx === -1 || powerIdx === -1) {
    console.error("Could not find wind speed or power columns.");
    console.error("Headers found:", header);
    process.exit(1);
  }

  const rows: ScadaRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));
    const ws = parseFloat(cols[windIdx]);
    const ap = parseFloat(cols[powerIdx]);
    const tp = theoIdx !== -1 ? parseFloat(cols[theoIdx]) : NaN;

    if (Number.isFinite(ws) && Number.isFinite(ap) && ws >= 0 && ap >= 0) {
      rows.push({
        windSpeed: ws,
        actualPower: ap,
        theoreticalPower: tp,
      });
    }
  }
  return rows;
}

// ─── Validation ──────────────────────────────────────────────────────────────

function run() {
  const csvPath = resolve(__dirname, "data", "T1.csv");

  let rows: ScadaRow[];
  try {
    rows = parseCsv(csvPath);
  } catch {
    console.error(
      "Could not read T1.csv. Download from:\n" +
        "https://www.kaggle.com/datasets/berkerisen/wind-turbine-scada-dataset\n" +
        "Place T1.csv in scripts/validate/data/"
    );
    process.exit(1);
  }

  console.log(`Loaded ${rows.length} valid SCADA records\n`);

  // Infer turbine specs from data
  const maxPower = Math.max(...rows.map((r) => r.actualPower));
  console.log(`Inferred rated power from data: ${maxPower.toFixed(0)} kW`);

  // Typical utility turbine specs (the SCADA turbine appears to be ~3.6 MW class)
  // We'll test multiple rotor diameters to find best fit
  const ratedPower = maxPower * 1000; // kW → W
  const airDensity = 1.225;
  const cutIn = 3.0;
  const ratedSpeed = 12.0;
  const cutOut = 25.0;

  // Try different rotor diameters to find best match
  const rotorDiameters = [80, 90, 100, 110, 116, 120, 130];

  console.log(
    "\n── Finding best rotor diameter fit ──────────────────────────────"
  );

  let bestDiameter = 100;
  let bestRmse = Infinity;

  for (const d of rotorDiameters) {
    const area = Math.PI * (d / 2) ** 2;
    let sumSqErr = 0;
    let count = 0;

    for (const row of rows) {
      if (row.windSpeed < cutIn || row.windSpeed > cutOut) continue;
      const predicted =
        calculateAveragePower(
          row.windSpeed,
          ratedPower,
          area,
          airDensity,
          cutIn,
          ratedSpeed,
          cutOut
        ) / 1000; // W → kW
      const err = predicted - row.actualPower;
      sumSqErr += err * err;
      count++;
    }

    const rmse = Math.sqrt(sumSqErr / count);
    if (rmse < bestRmse) {
      bestRmse = rmse;
      bestDiameter = d;
    }
    console.log(`  Rotor ${d}m → RMSE: ${rmse.toFixed(1)} kW`);
  }

  console.log(`\nBest fit: rotor diameter = ${bestDiameter}m`);

  // Full validation with best-fit diameter
  const sweptArea = Math.PI * (bestDiameter / 2) ** 2;

  console.log(
    "\n── Wind Speed Bin Analysis ─────────────────────────────────────"
  );
  console.log(
    "Bin(m/s) | Records | Avg Actual(kW) | Our Pred(kW) | Mfr Theo(kW) | Our Error% | Mfr Error%"
  );
  console.log("-".repeat(100));

  // Bin by 1 m/s increments
  const bins: Map<
    number,
    { actual: number[]; predicted: number[]; theoretical: number[] }
  > = new Map();

  for (const row of rows) {
    const bin = Math.floor(row.windSpeed);
    if (!bins.has(bin)) bins.set(bin, { actual: [], predicted: [], theoretical: [] });
    const b = bins.get(bin)!;
    b.actual.push(row.actualPower);

    const pred =
      calculateAveragePower(
        row.windSpeed,
        ratedPower,
        sweptArea,
        airDensity,
        cutIn,
        ratedSpeed,
        cutOut
      ) / 1000;
    b.predicted.push(pred);

    if (Number.isFinite(row.theoreticalPower)) {
      b.theoretical.push(row.theoreticalPower);
    }
  }

  const sortedBins = [...bins.entries()].sort((a, b) => a[0] - b[0]);

  let totalSumSqErr = 0;
  let totalSumSqErrTheo = 0;
  let totalAbsErr = 0;
  let totalAbsErrTheo = 0;
  let totalCount = 0;
  let totalActual = 0;
  let totalPredicted = 0;

  for (const [bin, data] of sortedBins) {
    if (data.actual.length < 10) continue; // skip sparse bins

    const avgActual =
      data.actual.reduce((s, v) => s + v, 0) / data.actual.length;
    const avgPred =
      data.predicted.reduce((s, v) => s + v, 0) / data.predicted.length;
    const avgTheo =
      data.theoretical.length > 0
        ? data.theoretical.reduce((s, v) => s + v, 0) /
          data.theoretical.length
        : NaN;

    const ourErrPct =
      avgActual > 10 ? (((avgPred - avgActual) / avgActual) * 100).toFixed(1) : "N/A";
    const mfrErrPct =
      avgActual > 10 && Number.isFinite(avgTheo)
        ? (((avgTheo - avgActual) / avgActual) * 100).toFixed(1)
        : "N/A";

    console.log(
      `${String(bin).padStart(3)}-${String(bin + 1).padStart(3)}   | ` +
        `${String(data.actual.length).padStart(7)} | ` +
        `${avgActual.toFixed(1).padStart(14)} | ` +
        `${avgPred.toFixed(1).padStart(12)} | ` +
        `${(Number.isFinite(avgTheo) ? avgTheo.toFixed(1) : "N/A").padStart(12)} | ` +
        `${String(ourErrPct).padStart(10)} | ` +
        `${String(mfrErrPct).padStart(10)}`
    );

    // Accumulate overall metrics
    for (let i = 0; i < data.actual.length; i++) {
      const err = data.predicted[i] - data.actual[i];
      totalSumSqErr += err * err;
      totalAbsErr += Math.abs(err);
      totalActual += data.actual[i];
      totalPredicted += data.predicted[i];
      totalCount++;

      if (i < data.theoretical.length && Number.isFinite(data.theoretical[i])) {
        const errT = data.theoretical[i] - data.actual[i];
        totalSumSqErrTheo += errT * errT;
        totalAbsErrTheo += Math.abs(errT);
      }
    }
  }

  // Overall statistics
  const rmse = Math.sqrt(totalSumSqErr / totalCount);
  const mae = totalAbsErr / totalCount;
  const bias = (totalPredicted - totalActual) / totalCount;
  const biasPercent = ((totalPredicted - totalActual) / totalActual) * 100;

  console.log("\n── Overall Statistics ──────────────────────────────────────────");
  console.log(`Total valid records:     ${totalCount}`);
  console.log(`RMSE:                    ${rmse.toFixed(1)} kW`);
  console.log(`MAE:                     ${mae.toFixed(1)} kW`);
  console.log(`Bias (pred - actual):    ${bias.toFixed(1)} kW (${biasPercent.toFixed(1)}%)`);
  console.log(`Total actual energy:     ${(totalActual / 6).toFixed(0)} kWh (10-min intervals → /6)`);
  console.log(`Total predicted energy:  ${(totalPredicted / 6).toFixed(0)} kWh`);

  if (totalSumSqErrTheo > 0) {
    const rmseTheo = Math.sqrt(totalSumSqErrTheo / totalCount);
    console.log(`\nManufacturer curve RMSE: ${rmseTheo.toFixed(1)} kW (for comparison)`);
  }

  console.log("\n── Interpretation ─────────────────────────────────────────────");
  if (Math.abs(biasPercent) < 10) {
    console.log("Our formula is within ±10% of measured output — ACCEPTABLE");
  } else if (biasPercent > 10) {
    console.log(
      `Our formula OVERESTIMATES by ${biasPercent.toFixed(1)}% — Cp=0.40 may be too high`
    );
  } else {
    console.log(
      `Our formula UNDERESTIMATES by ${Math.abs(biasPercent).toFixed(1)}%`
    );
  }
}

run();
