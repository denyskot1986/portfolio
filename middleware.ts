import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/skynet') && !pathname.startsWith('/skynet/login')) {
    const session = request.cookies.get('skynet_session')?.value;
    const secret = process.env.SKYNET_SESSION_SECRET;

    if (!session || session !== secret) {
      return NextResponse.redirect(new URL('/skynet/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/skynet/:path*'],
};
