import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect("/api/auth/signin");
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
