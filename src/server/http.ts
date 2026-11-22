import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { fieldErrors } from "@/lib/validation";
import { isSameOrigin, logSecurityEvent, rateLimit, ipHash } from "./security";

export type ApiError = {
  error: { code: string; message: string; fields?: Record<string, string> };
};

export function jsonError(status: number, code: string, message: string, fields?: Record<string, string>, headers?: HeadersInit) {
  return NextResponse.json<ApiError>({ error: { code, message, ...(fields ? { fields } : {}) } }, { status, headers });
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

const MAX_JSON_BYTES = 32 * 1024;

/**
 * Standard guard for state-changing JSON endpoints:
 *  - same-origin check (CSRF)
 *  - JSON content type only
 *  - body size limit
 *  - strict schema validation
 */
export async function readJson<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<{ ok: true; data: z.infer<S> } | { ok: false; response: NextResponse }> {
  if (!isSameOrigin(req.headers)) {
    logSecurityEvent("csrf_rejected", req.headers);
    return { ok: false, response: jsonError(403, "forbidden", "This request could not be verified. Refresh the page and try again.") };
  }
  const type = req.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) {
    return { ok: false, response: jsonError(415, "unsupported_media_type", "Unsupported request format.") };
  }
  const text = await req.text();
  if (text.length > MAX_JSON_BYTES) {
    return { ok: false, response: jsonError(413, "payload_too_large", "The request is too large.") };
  }
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    return { ok: false, response: jsonError(400, "invalid_json", "The request could not be read.") };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError(422, "validation_failed", "Please check the highlighted fields.", fieldErrors(parsed.error)),
    };
  }
  return { ok: true, data: parsed.data };
}

/** Same-origin check for endpoints without a JSON body (e.g. DELETE, multipart). */
export function guardOrigin(req: Request): NextResponse | null {
  if (!isSameOrigin(req.headers)) {
    logSecurityEvent("csrf_rejected", req.headers);
    return jsonError(403, "forbidden", "This request could not be verified. Refresh the page and try again.");
  }
  return null;
}

/** Test-only multiplier for per-IP buckets (all e2e traffic shares one IP). Ignored in production. */
function ipLimitScale(): number {
  if (process.env.NODE_ENV === "production") return 1;
  const n = Number(process.env.RATE_LIMIT_SCALE ?? "1");
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 100) : 1;
}

export function limit(req: Request, bucket: string, max: number, windowSeconds: number): NextResponse | null {
  const result = rateLimit(`${bucket}:${ipHash(req.headers)}`, max * ipLimitScale(), windowSeconds);
  if (result.ok) return null;
  logSecurityEvent("rate_limited", req.headers);
  return jsonError(
    429,
    "rate_limited",
    "Too many attempts. Please wait a few minutes and try again.",
    undefined,
    { "Retry-After": String(result.retryAfter) },
  );
}

/** Wraps a handler so unexpected errors never leak internals or stack traces. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error("[api] unhandled error", err instanceof Error ? err.message : "unknown");
      return jsonError(500, "server_error", "Something unexpected happened. Please try again in a moment.");
    }
  };
}
