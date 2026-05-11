# GreenCalc — Green Energy Calculator

Solar and wind energy production estimator with **SCADA-validated formulas**, region-aware ROI, and a curated equipment database. Built on the [NREL PVWatts](https://pvwatts.nrel.gov/) methodology and free public APIs (NASA POWER, Open-Meteo). No API keys required.

> **Live demo:** _coming soon — deploy URL goes here_
>
> **Author:** MD Nayeemur Rahman Biswas — [LinkedIn](https://www.linkedin.com/in/nayeemur-rahman/) · [GitHub](https://github.com/Codename-404)

<!-- TODO: add screenshot of the wizard at /quick-start once deployed -->

---

## What it does

- **Quick Start wizard** — appliance-first sizing. Pick what you want to power → see panel/battery/inverter bundles tailored to your demand and location.
- **Solar & wind calculators** — hourly-aware production estimates from NASA POWER climatology + manufacturer equipment specs.
- **Equipment browser** — 50+ panels, batteries, turbines, and inverters with filterable specs and side-by-side comparison.
- **System Builder** — combine equipment into a system, see capital cost, payback period, and 25-year ROI.
- **Learn center** — methodology articles, equipment-type guides, transparent calculation walkthroughs.

## Why it's interesting

Most online solar calculators wave their hands at "typical assumptions." This one shows the math, cites the source, and validates against real plant data:

| Formula                                                                     | Validated against                                                             | Result                                                                                                                 |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Wind power curve `P = 0.5 × ρ × A × v³ × Cp × η`                            | 10-min SCADA from a 3.6 MW onshore turbine (~50k data points, 3-25 m/s range) | **-0.7% bias overall**, RMSE < 3% in mid-range winds                                                                   |
| Solar production `E = P_rated × PSH × tiltCorr × tempDerate × (1 - losses)` | 15-min DC/AC readings from a real Indian solar plant (1,634 daytime points)   | **-12.9% bias** (most of which is methodological — see [methodology article](src/data/articles/how-we-calculate.json)) |

The full validation scripts live in [`scripts/validate/`](scripts/validate/) — anyone can rerun them against the source datasets.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript 5** strict mode
- **Jotai 2** for atomic state
- **Tailwind CSS 4** + **shadcn/ui** + **Base UI** primitives
- **Hono** for typed API routes (mounted under `/api`)
- **Zod 4** for schema validation
- **Recharts 3** for monthly production / ROI charts

## Architecture

Clean four-layer separation, no DB needed (static JSON is the equipment "repository"):

```
src/
├── app/                       # Next.js routes (page.tsx + client.tsx pattern)
│   ├── api/                   # Thin Next handlers → forward to Hono
│   ├── calculator/            # /calculator/solar, /calculator/wind
│   ├── equipment/             # Equipment browser
│   ├── learn/                 # Methodology articles
│   ├── quick-start/           # Redirects to / (wizard is the home)
│   └── system-builder/        # Build & price a full system
├── server/api/                # Hono routes (controllers) + middleware (cache, logging)
├── lib/                       # Pure calculation modules — no React, no I/O
│   ├── solar-calculations.ts  # PVWatts-style daily energy
│   ├── wind-calculations.ts   # Hub-height + power-curve model
│   ├── roi-calculations.ts    # Payback, NPV, 25-yr cashflow
│   ├── bundle-builder.ts      # Sizing logic for the Quick Start wizard
│   └── ...
├── store/                     # Jotai atoms + derived atoms
├── data/                      # Equipment specs, appliance presets, articles
└── components/                # UI (calculator/, equipment/, system-builder/, ui/)
```

## Data sources

| Source                                        | What it provides                                                                   | Cost              |
| --------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------- |
| [NASA POWER](https://power.larc.nasa.gov/)    | Long-term monthly climatology (irradiance, temperature, wind speed) at any lat/lon | Free, no key      |
| [Open-Meteo](https://open-meteo.com/)         | Backup weather data, geocoding fallback                                            | Free, no key      |
| [BigDataCloud](https://www.bigdatacloud.com/) | Reverse geocoding (lat/lon → city name)                                            | Free tier, no key |
| Equipment specs                               | Hand-curated from manufacturer datasheets                                          | Bundled JSON      |

## Setup

Requires Node 20+. Tested with Bun and npm.

```bash
git clone https://github.com/Codename-404/green-energy-calculator.git
cd green-energy-calculator
bun install        # or: npm install
bun dev            # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No `.env` setup needed for default operation — all APIs are keyless.

## Validation

Re-run the SCADA validation scripts after downloading the source datasets:

```bash
# 1. Download CSVs from Kaggle into scripts/validate/data/
#    - https://www.kaggle.com/datasets/berkerisen/wind-turbine-scada-dataset
#    - https://www.kaggle.com/datasets/anikannal/solar-power-generation-data

# 2. Run
bun run validate:wind
bun run validate:solar
```

Each script bins measured data by input variable, compares predicted vs actual, and prints RMSE, MAE, and bias%. See [`scripts/validate/README.md`](scripts/validate/README.md) for details.

## What this project cannot do

Honest limitations (also documented in the in-app methodology article):

- Doesn't model panel/turbine **degradation** over time (year-one estimate only).
- Doesn't model **inverter clipping** (no DC vs AC capacity distinction).
- Doesn't capture **microclimate** effects (NASA grid is ~50 km resolution).
- Uses a **single shading factor** — real shading is directional and time-of-day.
- Assumes **flat electricity rates** unless the user configures otherwise (no time-of-use).
- Climate data is a **40-year average**, not a forecast. Any given year will deviate ±15-20%.

For installations worth real money, get a certified installer using NREL SAM or PVsyst.

## Contributing

Equipment data is the easiest contribution path. To add a panel/battery/turbine/inverter:

1. Find the manufacturer datasheet.
2. Add an entry to the relevant `src/data/*.json` file matching the existing schema.
3. Open a PR.

Bug reports, validation against additional datasets, and methodology corrections are all welcome.

## License

[MIT](LICENSE) — fork it, ship it, learn from it.
