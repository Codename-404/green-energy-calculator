import { appliances as APPLIANCES } from "@/data";
import type {
  Appliance,
  ApplianceSelection,
  CustomAppliance,
  LoadProfile,
} from "@/types/appliance";

export { APPLIANCES };

export const APPLIANCE_BY_ID: Record<string, Appliance> = Object.fromEntries(
  APPLIANCES.map((a) => [a.id, a]),
);

export function aggregateLoad(
  selections: ApplianceSelection[],
  customs: CustomAppliance[] = [],
): LoadProfile {
  let dailyKwh = 0;
  let continuousKw = 0;
  let peakKw = 0;
  let itemCount = 0;

  for (const s of selections) {
    if (s.quantity <= 0) continue;
    const a = APPLIANCE_BY_ID[s.applianceId];
    if (!a) continue;
    const watts = s.wattsOverride ?? a.watts;
    const hours = s.hoursOverride ?? a.hoursPerDay;
    const duty = a.dutyCycle ?? 1;
    const surge = a.startupMultiplier ?? 1;

    dailyKwh += (watts * hours * duty * s.quantity) / 1000;
    continuousKw += (watts * s.quantity) / 1000;
    peakKw += (watts * surge * s.quantity) / 1000;
    itemCount += s.quantity;
  }

  for (const c of customs) {
    if (c.quantity <= 0 || c.watts <= 0) continue;
    dailyKwh += (c.watts * c.hoursPerDay * c.quantity) / 1000;
    continuousKw += (c.watts * c.quantity) / 1000;
    peakKw += (c.watts * c.quantity) / 1000;
    itemCount += c.quantity;
  }

  return {
    dailyKwh,
    annualKwh: dailyKwh * 365,
    continuousKw,
    peakKw,
    itemCount,
  };
}
