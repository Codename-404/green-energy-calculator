import { z } from "zod";

export const coordinatesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export const geocodeQuerySchema = z.object({
  q: z.string().min(1).max(200),
});

export const solarParamsSchema = z.object({
  panelCount: z.coerce.number().int().min(1).max(1000),
  tiltAngle: z.coerce.number().min(0).max(90),
  azimuth: z.coerce.number().min(0).max(360),
  shadingFactor: z.coerce.number().min(0).max(1),
  systemLosses: z.coerce.number().min(0).max(0.5),
});

export const windParamsSchema = z.object({
  hubHeight: z.coerce.number().min(5).max(200),
  terrainType: z.enum(["open", "suburban", "urban", "coastal"]),
});

export const heatingParamsSchema = z.object({
  homeSizeSqFt: z.coerce.number().min(100).max(50000),
  insulationQuality: z.enum(["poor", "average", "good", "excellent"]),
  stories: z.coerce.number().int().min(1).max(3),
  currentFuel: z.enum(["natural-gas", "oil", "electric-resistance", "propane", "coal", "kerosene", "none"]),
});
