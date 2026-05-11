# Calculation Validation Scripts

Validates our wind and solar power formulas against real-world Kaggle datasets.

## Setup

### 1. Download datasets

**Wind** — [Wind Turbine SCADA Dataset](https://www.kaggle.com/datasets/berkerisen/wind-turbine-scada-dataset)
- Download and place `T1.csv` in `scripts/validate/data/`

**Solar** — [Solar Power Generation Data](https://www.kaggle.com/datasets/anikannal/solar-power-generation-data)
- Download and place `Plant_1_Generation_Data.csv` and `Plant_1_Weather_Sensor_Data.csv` in `scripts/validate/data/`

### 2. Run

```bash
# Wind power curve validation
npx tsx scripts/validate/validate-wind.ts

# Solar production validation
npx tsx scripts/validate/validate-solar.ts
```

## What they validate

| Script | Formula tested | Input → Output |
|--------|---------------|----------------|
| `validate-wind.ts` | `P = 0.5 × ρ × A × v³ × Cp × η_gen × η_sys` | wind speed → power output |
| `validate-solar.ts` | `E = P_rated × irradiance × tempDerate × (1 - losses)` | irradiance + temp → power output |

Both scripts bin the data by input variable, compare predicted vs actual, and report RMSE, MAE, and bias%.
