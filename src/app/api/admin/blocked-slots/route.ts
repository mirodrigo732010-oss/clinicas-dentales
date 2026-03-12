import { NextRequest, NextResponse } from 'next/server';
import { blockedSlotsApi } from '@/lib/db-adapter';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;
  return !!sessionId;
}

// Get all blocked slots
export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    let blockedSlots;
    if (date) {
      blockedSlots = await blockedSlotsApi.getByDate(date);
    } else {
      blockedSlots = await blockedSlotsApi.getAll();
    }

    return NextResponse.json({ blockedSlots });
  } catch (error) {
    console.error('Error fetching blocked slots:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// Create blocked slot
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { date, time, reason } = await req.json();

    if (!date || !time) {
      return NextResponse.json({ error: 'Fecha y hora requeridas' }, { status: 400 });
    }

    const blockedSlot = await blockedSlotsApi.create({
      date,
      time,
      reason: reason || 'Bloqueado por el doctor',
    });

    return NextResponse.json({ success: true, blockedSlot });
  } catch (error) {
    console.error('Error creating blocked slot:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// Delete blocked slot
export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await blockedSlotsApi.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blocked slot:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
