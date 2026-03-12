import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;
  if (!sessionId) return null;
  return db.adminUser.findUnique({ where: { id: sessionId } });
}

const DEFAULT_PROMPTS: Record<string, string> = {
  hero: `Eres Elena, asistente de la Clínica Dental Sonrisa Perfecta en Madrid.

REGLAS: Máximo 40 palabras, 1-2 oraciones. Español de México, tono cálido y profesional.

Si pregunta por servicios: menciona tratamientos y ofrece cita gratuita.
Si pregunta precios: da rango y ofrece valoración gratuita.`,

  tecnologia: `Eres Elena, experta en tecnología dental.

REGLAS: Máximo 40 palabras, 1-2 oraciones. Español de México.

Explica brevemente: Escáner 3D (diagnóstico preciso), Láser (sin dolor), Radiografía Digital (menos radiación).`,

  tratamientos: `Eres Elena, experta en tratamientos dentales estéticos.

REGLAS: Máximo 40 palabras, 1-2 oraciones. Español de México.

Tratamientos: Diseño de Sonrisa (€1,500+), Ortodoncia Invisible (€2,500+), Implantes (€1,800+).`,

  experiencia: `Eres Elena, experta en bienestar dental.

REGLAS: Máximo 40 palabras, 1-2 oraciones. Español de México.

Menciona: ambiente tipo spa, música personalizada, equipo entrenado para pacientes ansiosos.`,

  testimonios: `Eres Elena, orgullosa de los resultados de la clínica.

REGLAS: Máximo 40 palabras, 1-2 oraciones. Español de México.

Menciona: 2000+ pacientes satisfechos, calificación 4.9/5.`,

  footer: `Eres Elena, lista para agendar citas.

REGLAS: Máximo 40 palabras, 1-2 oraciones. Español de México.

Horarios: Lun-Vie 9:00-20:00, Sáb 10:00-14:00. Ubicación: Calle Serrano 123, Madrid.`,
};

// Get all prompts
export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let prompts = await db.systemPrompt.findMany();

    // Create defaults if none exist
    if (prompts.length === 0) {
      for (const [section, prompt] of Object.entries(DEFAULT_PROMPTS)) {
        await db.systemPrompt.create({
          data: { section, prompt },
        });
      }
      prompts = await db.systemPrompt.findMany();
    }

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// Update prompt
export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { section, prompt } = await req.json();

    if (!section || !prompt) {
      return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 });
    }

    const updated = await db.systemPrompt.upsert({
      where: { section },
      update: { prompt },
      create: { section, prompt },
    });

    return NextResponse.json({ success: true, prompt: updated });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// Reset to defaults
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { section } = await req.json();

    if (section && DEFAULT_PROMPTS[section]) {
      const updated = await db.systemPrompt.upsert({
        where: { section },
        update: { prompt: DEFAULT_PROMPTS[section] },
        create: { section, prompt: DEFAULT_PROMPTS[section] },
      });
      return NextResponse.json({ success: true, prompt: updated });
    }

    // Reset all
    for (const [sec, prompt] of Object.entries(DEFAULT_PROMPTS)) {
      await db.systemPrompt.upsert({
        where: { section: sec },
        update: { prompt },
        create: { section: sec, prompt },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting prompts:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
