const cache = new Map<string, { data: unknown; timestamp: number }>();

export function getCached<T>(key: string, ttlMs: number): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function cacheKey(prefix: string, lat: number, lon: number): string {
  // Round to 2 decimal places to cluster nearby locations
  return `${prefix}:${lat.toFixed(2)}:${lon.toFixed(2)}`;
}
