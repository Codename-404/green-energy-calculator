const DEFAULT_TIMEOUT_MS = 8000;

export type UpstreamResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: 502 | 504; message: string };

/**
 * Fetch JSON from an external API with a timeout.
 *
 * - Network failure / DNS error → 502 with the underlying message.
 * - Timeout (AbortError)        → 504 "{label} timed out".
 * - HTTP non-2xx                → 502 "{label} returned HTTP {status}".
 * - 2xx but non-JSON body       → 502 "{label} returned malformed JSON".
 *
 * Routes pattern-match the result and forward both status and message
 * through Hono so the client sees a structured error.
 */
export async function fetchUpstream<T>(
  url: string,
  label: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<UpstreamResult<T>> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) {
      return {
        ok: false,
        status: 502,
        message: `${label} returned HTTP ${res.status}`,
      };
    }
    try {
      const data = (await res.json()) as T;
      return { ok: true, data };
    } catch {
      return {
        ok: false,
        status: 502,
        message: `${label} returned malformed JSON`,
      };
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      return { ok: false, status: 504, message: `${label} timed out` };
    }
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 502, message: `${label}: ${msg}` };
  }
}
