import { NextRequest, NextResponse } from 'next/server';
import { adminApi } from '@/lib/db-adapter';
import { cookies } from 'next/headers';

// Default admin credentials (in production, use proper auth)
const DEFAULT_ADMIN = {
  email: 'admin@sonrisaperfecta.es',
  password: 'admin123',
};

// Login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    // Check credentials against default admin
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      // Set cookie with admin session
      const cookieStore = await cookies();
      const sessionValue = 'admin-session-' + Date.now();
      cookieStore.set('admin_session', sessionValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return NextResponse.json({
        success: true,
        user: {
          id: sessionValue,
          email: DEFAULT_ADMIN.email,
          name: 'Administrador',
          role: 'admin',
        },
      });
    }

    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 });
  }
}

// Check session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionId,
        email: DEFAULT_ADMIN.email,
        name: 'Administrador',
        role: 'admin',
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// Logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return NextResponse.json({ success: true });
}
