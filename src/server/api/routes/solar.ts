import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { coordinatesSchema } from "@/lib/validators";
import { getCached, setCache, cacheKey } from "../middleware/cache";
import { fetchUpstream } from "../lib/upstream";
import { NASA_PARAMS, MONTH_KEYS } from "@/lib/constants";
import type { NasaPowerResponse, SolarIrradianceData } from "@/types/api";

const solar = new Hono();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

solar.get("/", zValidator("query", coordinatesSchema), async (c) => {
  const { lat, lon } = c.req.valid("query");

  // Check cache
  const key = cacheKey("solar", lat, lon);
  const cached = getCached<SolarIrradianceData>(key, CACHE_TTL);
  if (cached) {
    return c.json(cached);
  }

  // Fetch from NASA POWER Climatology API
  const params = NASA_PARAMS.join(",");
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=${params}&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`;

  const result = await fetchUpstream<NasaPowerResponse>(url, "NASA POWER");
  if (!result.ok) {
    return c.json({ error: result.message }, result.status);
  }

  const raw = result.data;
  const p = raw.properties.parameter;

  // Normalize into our format
  const monthly = MONTH_KEYS.map((monthKey) => ({
    month: monthKey,
    irradiance: p.ALLSKY_SFC_SW_DWN[monthKey] ?? 0,
    clearSkyIrradiance: p.CLRSKY_SFC_SW_DWN[monthKey] ?? 0,
    temperature: p.T2M[monthKey] ?? 0,
    temperatureMax: p.T2M_MAX[monthKey] ?? 0,
    temperatureMin: p.T2M_MIN[monthKey] ?? 0,
    windSpeed: p.WS2M[monthKey] ?? 0,
  }));

  const data: SolarIrradianceData = {
    location: {
      latitude: lat,
      longitude: lon,
      elevation: raw.geometry?.coordinates?.[2] ?? 0,
    },
    monthly,
    annual: {
      irradiance: p.ALLSKY_SFC_SW_DWN["ANN"] ?? 0,
      temperature: p.T2M["ANN"] ?? 0,
      windSpeed: p.WS2M["ANN"] ?? 0,
    },
  };

  setCache(key, data);
  return c.json(data);
});

export default solar;
