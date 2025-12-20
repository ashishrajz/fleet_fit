import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
  if (
    !token &&
    (pathname.startsWith("/warehouse") ||
      pathname.startsWith("/dealer"))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
