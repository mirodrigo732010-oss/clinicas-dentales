import { NextRequest, NextResponse } from 'next/server';
import { availabilityApi } from '@/lib/db-adapter';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;
  return !!sessionId;
}

// Get all availability
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const availability = await availabilityApi.getAll();
    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// Update availability
export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id, startTime, endTime, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const availability = await availabilityApi.update(id, { startTime, endTime, isActive });

    return NextResponse.json({ success: true, availability });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
