export function formatEnergy(kwh: number): string {
  if (kwh >= 1000000) return `${(kwh / 1000000).toFixed(1)} GWh`;
  if (kwh >= 1000) return `${(kwh / 1000).toFixed(1)} MWh`;
  return `${kwh.toFixed(1)} kWh`;
}

export function formatPower(watts: number): string {
  if (watts >= 1000000) return `${(watts / 1000000).toFixed(1)} MW`;
  if (watts >= 1000) return `${(watts / 1000).toFixed(1)} kW`;
  return `${watts.toFixed(0)} W`;
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyDetailed(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(value: number, decimals = 1): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCo2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} tons`;
  return `${kg.toFixed(0)} kg`;
}

export function formatWindSpeed(ms: number): string {
  return `${ms.toFixed(1)} m/s`;
}

export function formatTemperature(celsius: number): string {
  return `${celsius.toFixed(1)}°C`;
}

export function formatArea(sqm: number): string {
  return `${sqm.toFixed(1)} m²`;
}

export function formatCop(cop: number): string {
  return cop.toFixed(1);
}

export function formatFuelConsumption(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} tons`;
  return `${kg.toFixed(0)} kg`;
}

export function formatHdd(hdd: number): string {
  return `${hdd.toFixed(0)} HDD`;
}

export function formatBtu(btu: number): string {
  if (btu >= 1000) return `${(btu / 1000).toFixed(0)}K BTU/hr`;
  return `${btu.toFixed(0)} BTU/hr`;
}

export function formatSqFt(sqft: number): string {
  return `${new Intl.NumberFormat("en-US").format(sqft)} sq ft`;
}
