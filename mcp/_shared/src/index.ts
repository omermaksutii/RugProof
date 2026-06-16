/**
 * Shared helpers for Rugproof MCP servers. Zero runtime dependencies so every
 * server stays trivially buildable and offline-friendly.
 */

/** True when the user asked for offline mode (no network calls). */
export function isOffline(): boolean {
  return process.env.RUGPROOF_OFFLINE === "1";
}

/** Wrap an MCP tool result as the standard text-content envelope. */
export function textResult(obj: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }] };
}

/**
 * Uniform stub envelope so callers (and the test suite) can detect mock data the
 * same way across every server.
 */
export function stub(reason: string, data: Record<string, unknown> = {}) {
  return textResult({ stub: true, reason, ...data });
}

export interface FetchOpts {
  headers?: Record<string, string>;
  method?: string;
  body?: string;
  /** Total attempts before giving up (default 3). */
  retries?: number;
  /** Base backoff in ms; doubles each retry (default 400). */
  backoffMs?: number;
  /** Per-request timeout in ms (default 15000). */
  timeoutMs?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * fetch() JSON with retry + exponential backoff. Retries on network errors and
 * on 429 / 5xx (honouring Retry-After when present). Returns parsed JSON or
 * throws after the final attempt.
 */
export async function fetchJSON(url: string, opts: FetchOpts = {}): Promise<any> {
  const retries = opts.retries ?? 3;
  const backoffMs = opts.backoffMs ?? 400;
  const timeoutMs = opts.timeoutMs ?? 15000;
  let lastErr: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: opts.method,
        headers: opts.headers,
        body: opts.body,
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : backoffMs * 2 ** attempt;
        if (attempt < retries - 1) { await sleep(wait); continue; }
        throw new Error(`HTTP ${res.status} after ${retries} attempts`);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < retries - 1) { await sleep(backoffMs * 2 ** attempt); continue; }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/** Is a binary on PATH? Used by runner servers to decide real-vs-stub. */
export async function hasBinary(bin: string): Promise<boolean> {
  const { spawn } = await import("node:child_process");
  return new Promise((resolve) => {
    const probe = spawn(process.platform === "win32" ? "where" : "which", [bin]);
    probe.on("error", () => resolve(false));
    probe.on("close", (code) => resolve(code === 0));
  });
}
