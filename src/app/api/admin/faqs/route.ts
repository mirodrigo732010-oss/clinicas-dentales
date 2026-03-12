import { NextRequest, NextResponse } from 'next/server';
import { faqsApi } from '@/lib/db-adapter';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;
  return !!sessionId;
}

// Get all FAQs (admin view - includes inactive)
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const faqs = await faqsApi.getAll();
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// Create FAQ
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { question, answer, order, isActive, category } = await req.json();

    if (!question || !answer) {
      return NextResponse.json({ error: 'Pregunta y respuesta requeridas' }, { status: 400 });
    }

    const faq = await faqsApi.create({
      question,
      answer,
      order: order || 0,
      isActive: isActive !== false,
      category: category || 'general',
    });

    return NextResponse.json({ success: true, faq });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// Update FAQ
export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const faq = await faqsApi.update(id, data);

    return NextResponse.json({ success: true, faq });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// Delete FAQ
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

    await faqsApi.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
