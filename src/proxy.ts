import {
  COOKIE_NAME,
  cookieOptions,
  refreshCredentialsCookie,
} from "@features/coros/credentials";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  if (request.method !== "GET") return NextResponse.next();

  const current = request.cookies.get(COOKIE_NAME)?.value;
  if (!current) return NextResponse.next();

  const refreshed = await refreshCredentialsCookie(current);
  if (!refreshed) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, refreshed, cookieOptions);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|auth/|favicon.ico|icon.svg).*)"],
};
