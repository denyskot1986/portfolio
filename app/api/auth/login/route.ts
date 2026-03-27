import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const validUser = process.env.SKYNET_USER;
  const validPass = process.env.SKYNET_PASS;
  const sessionSecret = process.env.SKYNET_SESSION_SECRET;

  if (username === validUser && password === validPass) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('skynet_session', sessionSecret!, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ success: false, error: 'Access denied' }, { status: 401 });
}
