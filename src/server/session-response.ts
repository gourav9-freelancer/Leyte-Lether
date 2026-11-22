import "server-only";
import type { NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "./auth";

/** Issues a fresh session (rotation on every login prevents session fixation). */
export function attachNewSession(res: NextResponse, customerId: number, userAgent: string | null) {
  const { token, expires } = createSession(customerId, userAgent);
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expires));
  return res;
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(new Date(0)), maxAge: 0 });
  return res;
}
