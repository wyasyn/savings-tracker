import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

// Lightweight, edge-safe gate: presence of the session cookie only. The real
// session + onboarding checks happen in the (main) layout (server component),
// which can hit the database.
export default function proxy(request: NextRequest) {
  const hasSession = getSessionCookie(request)
  const { pathname } = request.nextUrl
  const isLogin = pathname === "/login"

  if (!hasSession && !isLogin) {
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  if (hasSession && isLogin) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Protect everything except auth API, the login page, legal pages, and assets.
  matcher: [
    "/((?!api/auth|login|terms|privacy|_next/static|_next/image|favicon.ico|icons).*)",
  ],
}
