// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute && token?.role !== 'ADMIN') {
    const url = req.nextUrl.clone();
    url.pathname = '/login'; // redireciona para sua página de login
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'], // aplica o middleware apenas nas rotas /admin
};
